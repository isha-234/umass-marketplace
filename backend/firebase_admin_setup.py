import json
import os
from pathlib import Path

import firebase_admin
from firebase_admin import credentials


def initialize_firebase_app():
    """
    Initialize Firebase Admin using either a service account file path
    or a raw JSON payload provided via environment variables.
    """
    if firebase_admin._apps:
        return firebase_admin.get_app()

    cred = None

    cred_path = os.getenv("FIREBASE_CREDENTIALS_FILE") or os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if cred_path and Path(cred_path).exists():
        cred = credentials.Certificate(cred_path)
    else:
        cred_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
        if cred_json:
            cred = credentials.Certificate(json.loads(cred_json))

    if not cred:
        raise RuntimeError(
            "Firebase credentials not configured. "
            "Set FIREBASE_CREDENTIALS_FILE (path to service account) or FIREBASE_CREDENTIALS_JSON."
        )

    return firebase_admin.initialize_app(cred)
