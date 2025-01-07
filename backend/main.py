from datetime import datetime, timedelta
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from sqlalchemy import text
import models
from spam_ml_model import load_model_and_tokenizer, predict_spam
from crud import create_user, create_message
from spf_dkim_checker import check_email_authentication, get_domain_from_email
import os

app = FastAPI()
models.Base.metadata.create_all(bind=engine)


# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Load the model and tokenizer once when the app starts
model, tokenizer = load_model_and_tokenizer()

class EmailData(BaseModel):
    text: str
    user: str  
    message_id: str
    dkim_selector: str | None = None 
    sender: str
    has_attachments: bool = False
    has_links: bool = False

class SpamAnalysisResponse(BaseModel):
    spam_score: float
    spam_label: str
    text_length: int
    attachments: bool
    links: bool
    spf_valid: bool
    dkim_valid: bool
    sender_domain: str
    is_personal_email: bool
    malicious_content: str
    user_id: str

    class Config:
        # Allow ORM models to work directly with Pydantic models
        orm_mode = True


# Endpoint for health check
@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/db_health")
async def db_health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1")) 
        return {"status": "ok", "message": "Database connection is successful"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/predict")
async def predict_email(data: EmailData, db: Session = Depends(get_db)) -> SpamAnalysisResponse:
    # Check if the message already exists
    message = db.query(models.Message).filter(models.Message.message_id == data.message_id).first()
    if message:
        # Return the existing analysis immediately
        return message.analysis

    # Check if the user exists, create if not
    user = db.query(models.User).filter(models.User.userid == data.user).first()
    if not user:
        user = create_user(db, data.user)

    # Predict spam score
    prediction_score = predict_spam(model, tokenizer, data.text)
    prediction_score = float(prediction_score)

    # Get the SPF and DKIM authentication status
    spf_valid, dkim_valid = check_email_authentication(data.sender, data.dkim_selector)

    # Extract domain and determine if it's a personal email
    sender_domain = get_domain_from_email(data.sender)
    is_personal_email = not data.dkim_selector  # Emails without DKIM selector are considered personal

    # Determine spam label
    if prediction_score < 0.2:
        # For personal emails, only check SPF
        if is_personal_email:
            spam_label = 'Suspicious' if not spf_valid else 'Safe'
        else:
            # For organizational emails, check both SPF and DKIM
            spam_label = 'Suspicious' if not spf_valid or not dkim_valid else 'Safe'
    elif prediction_score < 0.8:
        spam_label = 'Suspicious'
    else:
        if is_personal_email:
            # For personal emails, high risk only if SPF fails
            spam_label = 'High Risk' if not spf_valid else 'Suspicious'
        else:
            # For organizational emails, check both
            spam_label = 'High Risk' if not spf_valid or not dkim_valid else 'Suspicious'

    # Identify malicious content and adjust spam label
    malicious_content = "None"

    if data.has_attachments or data.has_links:
        if prediction_score >= 0.8 and spam_label == "Suspicious":
            spam_label = "High Risk"  # Escalate label
        malicious_content = "Detected" if spam_label == "High Risk" else "Low Threat"

    # Full analysis document
    full_analysis = {
        "spam_score": prediction_score,
        "spam_label": spam_label,
        "text_length": len(data.text),
        "attachments": data.has_attachments,
        "links": data.has_links,
        "spf_valid": spf_valid,
        "dkim_valid": dkim_valid,
        "sender_domain": sender_domain,
        "is_personal_email": is_personal_email,
        "malicious_content": malicious_content,
        "user_id": str(data.user),
    }

    # Create the message first
    message = create_message(db, user.id, data.message_id, full_analysis)

    # Update daily stats
    today = datetime.now().date()
    daily_stats = db.query(models.DailySpamStats).filter(
        models.DailySpamStats.user_id == user.id,
        models.DailySpamStats.date == today
    ).first()
    
    if not daily_stats:
        daily_stats = models.DailySpamStats(
            user_id=user.id,
            date=today,
            spam_count=0
        )
        db.add(daily_stats)
    
    # Update spam count if the email is classified as spam
    if spam_label in ['Suspicious', 'High Risk']:
        daily_stats.spam_count += 1
        db.commit()  # Commit the daily stats update

    # Return the analysis
    return SpamAnalysisResponse(**full_analysis)

@app.get("/api/spam-stats/last-week")
async def get_last_week_stats(db: Session = Depends(get_db), user: str = None):
    if not user:
        raise HTTPException(status_code=400, detail="User ID is required")
        
    user_record = db.query(models.User).filter(models.User.userid == user).first()
    if not user_record:
        # Return empty array instead of 404 error
        return []
        
    stats = models.DailySpamStats.get_last_week_stats(db, user_record.id)
    
    # Ensure we return a list of dictionaries
    return [
        {
            "date": stat.date.isoformat(),
            "spam_count": stat.spam_count
        }
        for stat in stats
    ]

@app.get("/api/spam-stats/improvement-rate")
async def get_improvement_rate(db: Session = Depends(get_db), user: str = None):
    if not user:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    user_record = db.query(models.User).filter(models.User.userid == user).first()
    if not user_record:
        raise HTTPException(status_code=404, detail="User not found")
    
    today = datetime.now().date()
    two_weeks_ago = today - timedelta(days=14)
    
    # Get all stats for the last 14 days
    stats = db.query(models.DailySpamStats)\
              .filter(models.DailySpamStats.user_id == user_record.id)\
              .filter(models.DailySpamStats.date >= two_weeks_ago)\
              .order_by(models.DailySpamStats.date)\
              .all()
    
    # Split into two periods and calculate averages
    one_week_ago = today - timedelta(days=7)
    
    previous_week_stats = [stat for stat in stats if stat.date < one_week_ago]
    current_week_stats = [stat for stat in stats if stat.date >= one_week_ago]
    
    # Calculate daily averages (to account for partial weeks)
    previous_week_avg = (sum(stat.spam_count for stat in previous_week_stats) / 7) if previous_week_stats else 0
    current_week_avg = (sum(stat.spam_count for stat in current_week_stats) / 7) if current_week_stats else 0
    
    # Calculate improvement rate
    if not previous_week_stats:
        # No previous data available
        improvement_rate = 0
    elif previous_week_avg == 0 and current_week_avg == 0:
        # Both weeks perfect
        improvement_rate = 0
    else:
        # Calculate the percent change
        # A positive number means fewer spam emails (improvement)
        # A negative number means more spam emails (worse)
        improvement_rate = -((current_week_avg - previous_week_avg) / max(previous_week_avg, 1)) * 100
    
    return {
        "previous_week_avg": round(previous_week_avg, 2),
        "current_week_avg": round(current_week_avg, 2),
        "improvement_rate": round(improvement_rate, 2),
        "previous_week_total": sum(stat.spam_count for stat in previous_week_stats),
        "current_week_total": sum(stat.spam_count for stat in current_week_stats)
    }