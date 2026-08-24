# FinAssist 📊

**FinAssist** is a modern, mobile-first Progressive Web Application (PWA) designed to empower salaried earners to effortlessly track spending, manage multiple accounts, automate recurring subscriptions, set category budgets, monitor net worth, and gain AI-assisted financial insights.

Built with **FastAPI**, **React + Vite**, **SQLite/PostgreSQL**, and **Google Gemini AI**.

---

## 🌟 Key Features

- **📱 Mobile-First Responsive PWA**: Installable on iOS/Android with offline persistence and touch-friendly interface.
- **🏷️ Dynamic Flat Categories & Tagging**: Custom categories with hex colors, Lucide icons, and multi-tag breakdown (e.g. `Food` ➔ `Groceries`, `Delivery`, `Dining Out`).
- **💳 Accounts & Net Worth Tracking**: Track Cash, Bank Accounts, Credit Cards, and Wallets with automatic balance reconciliation.
- **🔄 Subscriptions & Recurring Bills**: Auto-logging recurring engine with next-due-date reminders.
- **🎯 Category Budgets & Envelope Limits**: Monthly limit tracking, overspend warnings, and visual progress gauges.
- **📈 Investments & Debts Ledger**: SIPs, Mutual Funds, Stocks, and IOU tracker (Lent / Borrowed).
- **🤖 AI Financial Coach**: Context-aware AI assistant (powered by Gemini) for conversational logging, habit analysis, and educational financial coaching.
- **📄 Statements & Visual Reports**: Interactive Pie charts, monthly trend bars, CSV transaction export, and printable reports.

---

## 🏗️ Architecture & Tech Stack

```
FinAssist/
├── backend/                  # FastAPI Python Application
│   ├── app/
│   │   ├── routers/          # Modular API Endpoints
│   │   ├── crud.py           # Database Operations & Calculation Engines
│   │   ├── models.py         # SQLAlchemy ORM Models
│   │   ├── schemas.py        # Pydantic Validation Schemas
│   │   └── main.py           # Application Entrypoint & Middleware
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                 # React + Vite PWA Application
    ├── src/
    │   ├── components/       # Views (Dashboard, Accounts, Budgets, Subscriptions, etc.)
    │   ├── context/          # Auth Context & Local Session State
    │   ├── api/client.js     # Axios API Client with Environment Fallbacks
    │   └── App.jsx           # App Routing & Shell
    ├── package.json
    ├── vercel.json           # Vercel SPA Routing Configuration
    └── .env.example
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\Activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Run FastAPI backend on port 8088
uvicorn app.main:app --reload --port 8088
```

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server on port 5180
npm run dev
```

Open [http://localhost:5180](http://localhost:5180) in your browser.

---

## 🌐 Deploying to Vercel (Frontend) & Render / Railway (Backend)

Because this is a full-stack application (Python FastAPI Backend + React Frontend), the recommended deployment strategy is:
1. **Frontend**: Deploy on **Vercel** (Fast CDN + PWA support).
2. **Backend**: Deploy on **Render**, **Railway**, or **Fly.io**.

---

### Step 1: Deploy Backend (Render / Railway)

1. Create a new **Web Service** on [Render](https://render.com) or [Railway](https://railway.app) connected to your GitHub repo.
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add **Environment Variables**:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key from Google AI Studio)*
   - `SECRET_KEY`: *(A random 32+ character string for JWT security)*
6. Copy your deployed backend URL (e.g. `https://finassist-api.onrender.com`).

---

### Step 2: Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new) and import your `finassist` GitHub repository.
2. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   Add the following under **Project Settings ➔ Environment Variables**:
   - `VITE_API_URL` = `https://finassist-api.onrender.com` *(your backend URL)*
4. Click **Deploy**.

Vercel will build and serve your frontend PWA with SSL and automatic global CDN routing.

---

## 🔒 Environment Variables Summary

### Backend (`backend/.env`)
| Variable | Description | Required |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | API Key for Google Gemini LLM Chatbot | Yes |
| `SECRET_KEY` | Secret salt for password hashing & JWT generation | Yes |
| `DATABASE_URL` | SQLAlchemy Database URI (Defaults to SQLite `sqlite:///./finassist.db`) | Optional |

### Frontend (`frontend/.env`)
| Variable | Description | Required |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API URL pointing to your deployed backend | In Production |

---

## 📄 License
MIT License. Built for personal finance management.
