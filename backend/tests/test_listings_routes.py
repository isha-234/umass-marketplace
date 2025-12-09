import pytest
import pytest_asyncio
from bson import ObjectId
from datetime import datetime, timedelta
from httpx import AsyncClient, ASGITransport

import auth
import ViewListings
import sellerCreateListing
import main
from .conftest import FakeCollection, make_item


@pytest_asyncio.fixture
async def listings_client(tmp_path):
    fake_items = FakeCollection()

    original_items = sellerCreateListing.items_collection
    original_view_items = ViewListings.items_collection
    original_upload_dir = sellerCreateListing.UPLOAD_DIR

    sellerCreateListing.items_collection = fake_items
    ViewListings.items_collection = fake_items
    sellerCreateListing.UPLOAD_DIR = tmp_path

    main.app.dependency_overrides[auth.get_current_user] = lambda: {
        "uid": "user-123",
        "email": "user@example.com",
        "email_verified": True,
    }

    transport = ASGITransport(app=main.app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client, fake_items

    main.app.dependency_overrides.clear()
    sellerCreateListing.items_collection = original_items
    ViewListings.items_collection = original_view_items
    sellerCreateListing.UPLOAD_DIR = original_upload_dir


@pytest.mark.asyncio
async def test_create_listing_persists_document(listings_client):
    client, fake_items = listings_client
    response = await client.post(
        "/listing/insert",
        data={
            "title": "Wooden Desk",
            "price": 120.5,
            "category": "Furniture",
            "condition": "Used",
            "description": "Solid oak desk",
            "location": "Amherst",
            "deliveryOption": "Pickup",
            "contactEmail": "seller@example.com",
            "status": "draft",
            "existingImages": "",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["title"] == "Wooden Desk"
    assert body["id"]

    stored = fake_items.docs[0]
    assert stored["title"] == "Wooden Desk"
    assert stored["ownerUid"] == "user-123"
    assert stored["contactEmail"] == "seller@example.com"


@pytest.mark.asyncio
async def test_update_listing_respects_owner(listings_client):
    client, fake_items = listings_client
    listing_id = ObjectId()
    await fake_items.insert_one(
        make_item(
            owner_uid="user-123",
            _id=listing_id,
            title="Old Title",
            status="draft",
        )
    )

    response = await client.post(
        "/listing/insert",
        data={
            "listingId": str(listing_id),
            "title": "Updated Title",
            "price": 90,
            "category": "Furniture",
            "condition": "Used",
            "description": "Updated description",
            "location": "Amherst",
            "deliveryOption": "Pickup",
            "contactEmail": "seller@example.com",
            "status": "published",
            "existingImages": "",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "updated"
    assert body["images"] == []

    updated = next(d for d in fake_items.docs if d["_id"] == listing_id)
    assert updated["title"] == "Updated Title"
    assert updated["status"] == "published"
    assert "updatedAt" in updated


@pytest.mark.asyncio
async def test_listing_filters_and_metadata_endpoints(listings_client):
    client, fake_items = listings_client
    now = datetime.utcnow()
    await fake_items.insert_one(
        make_item(
            _id=ObjectId(),
            title="Red Chair",
            description="Comfortable",
            category="Furniture",
            condition="Used",
            price=25,
            createdAt=now - timedelta(hours=1),
        )
    )
    await fake_items.insert_one(
        make_item(
            _id=ObjectId(),
            title="Phone",
            description="Smartphone with camera",
            category="Electronics",
            condition="New",
            price=300,
            createdAt=now,
        )
    )

    filtered = await client.get(
        "/listing/all",
        params={"q": "phone", "category": "Electronics"},
    )
    assert filtered.status_code == 200
    results = filtered.json()
    assert len(results) == 1
    assert results[0]["title"] == "Phone"
    assert isinstance(results[0]["_id"], str)

    categories = await client.get("/listing/categories")
    assert categories.status_code == 200
    assert categories.json()["categories"] == ["Electronics", "Furniture"]

    conditions = await client.get("/listing/conditions")
    assert conditions.status_code == 200
    assert conditions.json()["conditions"] == ["New", "Used"]
