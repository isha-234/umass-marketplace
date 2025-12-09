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

#### Configure Environment (backend/.env)

Create `backend/.env` with:
- `MONGODB_URI=<your Mongo connection string>` (required)
- `FIREBASE_CREDENTIALS_FILE=/full/path/to/serviceAccountKey.json` (or `FIREBASE_CREDENTIALS_JSON=<service-account-json>`; required for auth)
- `GEMINI_API_KEY=<your Google Gemini API key>` (required for AI Assist)

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

#### Configure Environment (frontend/.env)
Create `frontend/.env` with your Firebase web config, for example:
```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

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
