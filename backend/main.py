from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from sqlalchemy import text
import models
from spam_ml_model import load_model_and_tokenizer, predict_spam
from crud import create_user, create_message

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
async def predict_email(data: EmailData, db: Session = Depends(get_db)) -> dict[str, float]:
    # Check if the user exists, create if not
    user = db.query(models.User).filter(models.User.email == data.user).first()
    if not user:
        user = create_user(db, data.user)

    # Check if the message exists, create if not
    message = db.query(models.Message).filter(models.Message.message_id == data.message_id).first()
    if not message:
        prediction = predict_spam(model, tokenizer, data.text)
        message = create_message(db, user.id, data.message_id, str(prediction))

    return {"prediction": float(message.analysis)}