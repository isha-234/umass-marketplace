# UMass Marketplace

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/umass-marketplace.git
cd umass-marketplace
```

### 2. Backend Setup

#### Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

#### Run the FastAPI Server

```bash
uvicorn main:app --reload
```

Your backend should now be running at: http://127.0.0.1:8000

### 3. Frontend Setup

Open a new terminal tab:

```bash
cd frontend
npm install
npm start
```

Your frontend application should now be running at http://127.0.0.1:3000.

### 4. Running Tests

**Backend (FastAPI)**
```bash
cd backend
source venv/bin/activate  # if not already active
pip install -r requirements.txt  # ensures pytest/httpx available
python -m pytest tests
```

**Frontend (React)**
```bash
cd frontend
npm install
npm test -- App.test.js ProtectedRoute.test.js
# or run the full suite:
# npm test
```

---

## Requirements

- Python 3.7+
- Node.js
- npm

## Firebase Authentication

1. Create a Firebase project, enable Email/Password auth, and register a Web app.  
2. Copy the Firebase web config into `frontend/.env` (see `frontend/.env.example` for keys).  
3. Add a Firebase service account key file path to the backend environment: set `FIREBASE_CREDENTIALS_FILE=/full/path/to/serviceAccountKey.json` (or set `FIREBASE_CREDENTIALS_JSON` to the JSON string).  
4. Install dependencies after updating config:
   - Backend: `pip install -r requirements.txt` (adds `firebase-admin`)
   - Frontend: `npm install` (adds `firebase`)  
5. Start the servers; the frontend will obtain an ID token from Firebase and send it to the FastAPI backend in the `Authorization: Bearer <token>` header.
