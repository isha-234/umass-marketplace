import os
import sys
from pathlib import Path
from bson import ObjectId

# Ensure backend source is importable when tests run from this folder
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Provide a dummy Mongo URI so database.py does not raise during import
os.environ.setdefault("MONGODB_URI", "mongodb://localhost:27017/test")

# Short-circuit Firebase initialization for tests
try:
    import firebase_admin

    fake_app = object()
    firebase_admin._apps = {"default": fake_app}
    firebase_admin.get_app = lambda name=None: fake_app  # type: ignore[attr-defined]
except Exception:
    # If firebase_admin is not available in the test environment, silently ignore;
    # individual tests can still mock the dependency.
    firebase_admin = None


class FakeCursor:
    def __init__(self, docs):
        self.docs = list(docs)
        self._iter = None

    def sort(self, spec):
        if not spec:
            return self
        key, direction = spec[0]
        reverse = direction == -1
        self.docs.sort(key=lambda d: d.get(key), reverse=reverse)
        return self

    def __aiter__(self):
        self._iter = iter(self.docs)
        return self

    async def __anext__(self):
        if self._iter is None:
            self._iter = iter(self.docs)
        try:
            return dict(next(self._iter))
        except StopIteration as exc:
            raise StopAsyncIteration from exc

    async def to_list(self, length=None):
        return [dict(d) for d in self.docs]


class FakeCollection:
    def __init__(self):
        self.docs: list[dict] = []

    def clear(self):
        self.docs.clear()

    async def insert_one(self, doc):
        stored = dict(doc)
        stored.setdefault("_id", ObjectId())
        self.docs.append(stored)
        return type("InsertOneResult", (), {"inserted_id": stored["_id"]})

    async def find_one(self, query):
        for doc in self.docs:
            if self._matches(doc, query):
                return dict(doc)
        return None

    def find(self, query=None):
        query = query or {}
        matched = [d for d in self.docs if self._matches(d, query)]
        return FakeCursor(matched)

    async def distinct(self, field):
        return list({d.get(field) for d in self.docs if field in d})

    async def update_one(self, query, update):
        matched = 0
        for doc in self.docs:
            if self._matches(doc, query):
                matched += 1
                doc.update(update.get("$set", {}))
                break
        return type("UpdateResult", (), {"matched_count": matched})

    def _matches(self, doc, query):
        if "$or" in query:
            return any(self._matches(doc, condition) for condition in query["$or"])

        for key, expected in query.items():
            if isinstance(expected, dict) and "$regex" in expected:
                pattern = str(expected["$regex"]).lower()
                value = str(doc.get(key, "")).lower()
                if pattern not in value:
                    return False
            elif doc.get(key) != expected:
                return False
        return True


def make_item(owner_uid="user-123", **overrides):
    """Helper to build listing documents."""
    base = {
        "title": "Sample",
        "price": 10.0,
        "category": "General",
        "condition": "Used",
        "description": "Sample description",
        "location": "Amherst",
        "deliveryOption": "Pickup",
        "contactEmail": "user@example.com",
        "images": [],
        "status": "draft",
        "ownerUid": owner_uid,
    }
    base.update(overrides)
    return base


def make_event(**overrides):
    base = {
        "title": "Career Fair",
        "date": "2025-01-01",
        "location": "Campus Center",
        "description": "Meet employers",
        "category": "Career",
        "image": None,
    }
    base.update(overrides)
    return base
