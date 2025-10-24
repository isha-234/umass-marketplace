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

---

## Requirements

- Python 3.7+
- Node.js
- npm
