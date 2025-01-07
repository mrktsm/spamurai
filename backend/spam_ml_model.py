# ml_model.py
import tensorflow as tf
import pickle
import os
import gc

os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
tf.config.set_visible_devices([], 'GPU')


def load_model_and_tokenizer():
    try:
        # Clear any existing sessions
        tf.keras.backend.clear_session()
        
        # Configure TensorFlow for CPU only
        tf.config.threading.set_intra_op_parallelism_threads(1)
        tf.config.threading.set_inter_op_parallelism_threads(1)
        
        # Load model with minimal memory usage
        model = tf.keras.models.load_model(
            "model/new_spam_email_model.keras",
            compile=False
        )
        
        # Load tokenizer
        with open("model/tokenizer.pkl", "rb") as f:
            tokenizer = pickle.load(f)
        
        # Force garbage collection
        gc.collect()
        
        return model, tokenizer
    
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

def predict_spam(model, tokenizer, text: str) -> float:
    try:
        # Clear session before prediction
        tf.keras.backend.clear_session()
        
        # Process single input with minimal memory
        seq = tokenizer.texts_to_sequences([text])
        padded_seq = tf.keras.preprocessing.sequence.pad_sequences(
            seq,
            maxlen=100,
            padding='post',
            truncating='post'
        )
        
        # Predict with minimal batch size
        prediction = model.predict(
            padded_seq,
            batch_size=1,
            verbose=0
        )[0][0]
        
        # Clean up
        gc.collect()
        
        return float(prediction)
    
    except Exception as e:
        print(f"Error during prediction: {e}")
        raise
