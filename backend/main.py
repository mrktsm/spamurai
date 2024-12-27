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
async def predict_email(data: EmailData, db: Session = Depends(get_db)) -> dict[str, str]:
    # Check if the user exists, create if not
    user = db.query(models.User).filter(models.User.email == data.user).first()
    if not user:
        user = create_user(db, data.user)

    # Check if the message exists, create if not
    message = db.query(models.Message).filter(models.Message.message_id == data.message_id).first()
    if not message:
        # Predict spam score
        prediction = predict_spam(model, tokenizer, data.text)
        message = create_message(db, user.id, data.message_id, str(prediction))

    # Get the SPF and DKIM authentication status
    spf_valid, dkim_valid = check_email_authentication(data.sender, data.dkim_selector)

    # Classify the email based on the prediction score and authentication checks
    prediction_score = float(message.analysis)
    
    # Extract domain for checking if it's a personal email
    sender_domain = get_domain_from_email(data.sender)
    is_personal_email = not data.dkim_selector  # Consider emails without DKIM selector as personal

    if prediction_score < 0.2:
        # For personal emails, only check SPF
        if is_personal_email:
            spam_label = 'suspicious' if not spf_valid else 'safe'
        else:
            # For organizational emails, check both SPF and DKIM
            spam_label = 'suspicious' if not spf_valid or not dkim_valid else 'safe'
    elif prediction_score < 0.8:
        spam_label = 'suspicious'
    else:
        if is_personal_email:
            # For personal emails, high risk only if SPF fails
            spam_label = 'high risk' if not spf_valid else 'suspicious'
        else:
            # For organizational emails, check both
            spam_label = 'high risk' if not spf_valid or not dkim_valid else 'suspicious'

    malicious_content = "none"
    if spam_label == 'suspicious':
        if data.has_attachments or data.has_links:
            malicious_content = "suspicious"
    elif spam_label == 'high risk':
        if data.has_attachments or data.has_links:
            malicious_content = "detected"

    return {
        "prediction": str(prediction_score),
        "label": spam_label,
        "spf_valid": str(spf_valid),
        "dkim_valid": str(dkim_valid),
        "is_personal_email": str(is_personal_email),
        "malicious_content": str(malicious_content)
    }
