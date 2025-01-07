from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, JSON, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    userid = Column(String, unique=True, index=True)  # Renamed from email to userid

    # Relationship with the Message table (one-to-many)
    messages = relationship("Message", back_populates="owner")

    # Relationship with the DailySpamStats table (one-to-many)
    daily_stats = relationship("DailySpamStats", back_populates="user")


class Message(Base):
    __tablename__ = 'messages'

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String, unique=True, index=True)
    analysis = Column(JSON, nullable=False)  # Changed from Text to JSON
    user_id = Column(Integer, ForeignKey('users.id'))

    # Relationship with the User table (many-to-one)
    owner = relationship("User", back_populates="messages")

class DailySpamStats(Base):
    __tablename__ = 'daily_spam_stats'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    date = Column(Date, nullable=False)
    spam_count = Column(Integer, default=0)
    
    user = relationship("User", back_populates="daily_stats")

    @classmethod
    def get_last_week_stats(cls, db, user_id):
        """Get spam statistics for the last 7 days."""
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        
        return db.query(cls)\
            .filter(cls.user_id == user_id)\
            .filter(cls.date >= week_ago)\
            .order_by(cls.date)\
            .all()