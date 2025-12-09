import pytest
import pytest_asyncio
from bson import ObjectId
from httpx import AsyncClient, ASGITransport

import events
import main
from .conftest import FakeCollection, make_event


@pytest_asyncio.fixture
async def events_client():
    fake_events = FakeCollection()
    original_events = events.events_collection
    events.events_collection = fake_events

    transport = ASGITransport(app=main.app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client, fake_events

    events.events_collection = original_events


@pytest.mark.asyncio
async def test_get_events_returns_all(events_client):
    client, fake_events = events_client
    await fake_events.insert_one(make_event(_id=ObjectId(), title="Job Fair"))
    await fake_events.insert_one(make_event(_id=ObjectId(), title="Club Expo"))

    response = await client.get("/api/events/")
    assert response.status_code == 200
    data = response.json()
    assert {event["title"] for event in data} == {"Job Fair", "Club Expo"}
    assert all("id" in event for event in data)


@pytest.mark.asyncio
async def test_get_event_handles_not_found(events_client):
    client, _ = events_client
    missing_id = ObjectId()

    response = await client.get(f"/api/events/{missing_id}")
    assert response.status_code == 404
    assert "Event not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_create_event_persists(events_client):
    client, fake_events = events_client
    payload = {
        "title": "Hackathon",
        "date": "2025-02-02",
        "location": "Library",
        "description": "24 hour build",
        "category": "Tech",
        "image": None,
    }

    response = await client.post("/api/events/", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Hackathon"
    assert body["category"] == "Tech"
    assert "id" in body

    stored = fake_events.docs[0]
    assert stored["title"] == "Hackathon"
    assert stored["description"] == "24 hour build"
