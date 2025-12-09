import pytest
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

firebase_admin = pytest.importorskip("firebase_admin")
from firebase_admin import auth as firebase_auth

from auth import get_current_user


@pytest.mark.asyncio
async def test_missing_token_rejected():
    with pytest.raises(HTTPException) as exc:
        await get_current_user(token=None)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Missing Authorization header" in exc.value.detail


@pytest.mark.asyncio
async def test_token_must_be_verified(monkeypatch):
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token-123")

    # Verified token passes through
    monkeypatch.setattr(
        firebase_auth,
        "verify_id_token",
        lambda token: {
            "uid": "abc123",
            "email": "student@umass.edu",
            "email_verified": True,
        },
    )
    user = await get_current_user(token=credentials)
    assert user["uid"] == "abc123"
    assert user["email_verified"] is True

    # Unverified token fails fast
    monkeypatch.setattr(
        firebase_auth,
        "verify_id_token",
        lambda token: {
            "uid": "abc123",
            "email": "student@umass.edu",
            "email_verified": False,
        },
    )
    with pytest.raises(HTTPException) as exc:
        await get_current_user(token=credentials)

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Email not verified" in exc.value.detail
