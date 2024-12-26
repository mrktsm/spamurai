from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)

    # Relationship with the Message table (one-to-many)
    messages = relationship("Message", back_populates="owner")

class Message(Base):
    __tablename__ = 'messages'

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String, unique=True, index=True)
    analysis = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))

    # Relationship with the User table (many-to-one)
    owner = relationship("User", back_populates="messages")
