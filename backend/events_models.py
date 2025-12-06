# backend/events_model.py
from pydantic import BaseModel
from typing import Optional

class Event(BaseModel):
    id: Optional[str] = None
    title: str
    date: str
    location: str
    description: str
    category: str
    image: Optional[str] = None

class EventCreate(BaseModel):
    title: str
    date: str
    location: str
    description: str
    category: str
    image: Optional[str] = None
