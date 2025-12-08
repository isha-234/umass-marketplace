from fastapi import APIRouter, HTTPException
from bson import ObjectId
from events_models import Event, EventCreate
from database import get_events_collection

router = APIRouter(
    prefix="/api/events",
    tags=["events"]
)

events_collection = get_events_collection()

def fix_id(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@router.get("/")
async def get_events():
    events = []
    async for e in events_collection.find():
        events.append(fix_id(e))
    return events

@router.get("/{event_id}")
async def get_event(event_id: str):
    event = await events_collection.find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return fix_id(event)

@router.post("/")
async def create_event(event: EventCreate):
    result = await events_collection.insert_one(event.dict())
    new_event = await events_collection.find_one({"_id": result.inserted_id})
    return fix_id(new_event)
