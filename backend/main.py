from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import pickle
from fastapi import Request
from fastapi.responses import RedirectResponse
import requests

app = FastAPI()

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)


# Load the model and tokenizer once when the app starts
model = tf.keras.models.load_model("model/spam_email_model.keras")
with open("model/tokenizer.pkl", "rb") as f:
    tokenizer = pickle.load(f)

# Endpoint for health check
@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}

class EmailData(BaseModel):
    text: str

@app.post("/predict")
async def predict_email(data: EmailData) -> dict[str, float]:
    # Preprocess the input text and tokenize it
    seq = tokenizer.texts_to_sequences([data.text])
    padded_seq = tf.keras.preprocessing.sequence.pad_sequences(seq, maxlen=100, padding='post', truncating='post')
    
    # Make the prediction using the trained model
    prediction = model.predict(padded_seq)[0][0]
    
    return {"prediction": prediction}

CLIENT_ID = "YOUR_CLIENT_ID"
CLIENT_SECRET = "YOUR_CLIENT_SECRET"
REDIRECT_URI = "https://your-backend-url.com/oauth2callback"
AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
SCOPE = "https://www.googleapis.com/auth/gmail.readonly"

@app.get("/oauth2callback")
async def oauth2callback(request: Request):
    # Extract the authorization code from the request
    code = request.query_params.get("code")
    if not code:
        return {"error": "Missing authorization code"}

    # Exchange the authorization code for an access token and refresh token
    response = requests.post(
        TOKEN_URL,
        data={
            "code": code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code",
        },
    )

    # Handle response
    if response.status_code != 200:
        return {"error": "Failed to obtain access token"}

    tokens = response.json()
    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")
    # Store tokens securely (e.g., in a database or session)
    
    # Redirect back to your frontend after successful authentication
    return RedirectResponse(url="https://your-frontend-url.com/success")