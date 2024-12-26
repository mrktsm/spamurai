# ml_model.py
import tensorflow as tf
import pickle

def load_model_and_tokenizer():
    # Load the model and tokenizer
    model = tf.keras.models.load_model("model/new_spam_email_model.keras")
    with open("model/tokenizer.pkl", "rb") as f:
        tokenizer = pickle.load(f)
    return model, tokenizer

def predict_spam(model, tokenizer, text: str) -> float:
    # Preprocess the input text and tokenize it
    seq = tokenizer.texts_to_sequences([text])
    padded_seq = tf.keras.preprocessing.sequence.pad_sequences(seq, maxlen=100, padding='post', truncating='post')
    
    # Make the prediction using the trained model
    prediction = model.predict(padded_seq)[0][0]
    return prediction
