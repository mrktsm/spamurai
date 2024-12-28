from sqlalchemy.orm import Session
import models

def create_user(db: Session, userid: str):
    db_user = models.User(userid=userid)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_message(db: Session, user_id: int, message_id: str, analysis: dict):
    db_message = models.Message(user_id=user_id, message_id=message_id, analysis=analysis)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message
