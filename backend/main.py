from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import pickle
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session

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
model = tf.keras.models.load_model("model/new_spam_email_model.keras")
with open("model/tokenizer.pkl", "rb") as f:
    tokenizer = pickle.load(f)


class EmailData(BaseModel):
    text: str

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
        # Perform a simple query to check the connection
        db.execute("SELECT 1")  # This query is just to check if the DB is responsive
        return {"status": "ok", "message": "Database connection is successful"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/predict")
async def predict_email(data: EmailData) -> dict[str, float]:
    # Preprocess the input text and tokenize it
    seq = tokenizer.texts_to_sequences([data.text])
    padded_seq = tf.keras.preprocessing.sequence.pad_sequences(seq, maxlen=100, padding='post', truncating='post')
    
    # Make the prediction using the trained model
    prediction = model.predict(padded_seq)[0][0]
    
    return {"prediction": prediction}
