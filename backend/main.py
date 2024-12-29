from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from sqlalchemy import text
import models
from spam_ml_model import load_model_and_tokenizer, predict_spam
from crud import create_user, create_message
from spf_dkim_checker import check_email_authentication, get_domain_from_email

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

    # Identify malicious content based on label and email attributes
    malicious_content = "None"
    if spam_label == 'Suspicious':
        if data.has_attachments or data.has_links:
            malicious_content = "Suspicious"
    elif spam_label == 'High Risk':
        if data.has_attachments or data.has_links:
            malicious_content = "Detected"

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
    }

    # Save the full analysis to the database
    message = create_message(db, user.id, data.message_id, full_analysis)

    # Return the newly created analysis
    return SpamAnalysisResponse(**full_analysis)
