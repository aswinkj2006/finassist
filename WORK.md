# FinAssist — Work Status

## Project Overview

FinAssist is a mobile-first PWA for first-time salaried earners in India to log spending, track savings goals, and compute financial health scores. Built by **The Expendables** (4-person student team) using OpenCode.

---

## What's Been Built (✅ Done)

### Backend — FastAPI + SQLite + SQLAlchemy

| Layer | Files | Status |
|---|---|---|
| **Database** | `backend/app/database.py` — SQLite engine, session, `get_db` dependency | ✅ Done |
| **ORM Models** | `backend/app/models.py` — User, IncomeSource, Goal, Transaction (with enums: category=needs/wants/savings_investing, source=manual/SMS/OCR/chat) | ✅ Done |
| **Pydantic Schemas** | `backend/app/schemas.py` — Create/Read/Update schemas for all 4 entities | ✅ Done |
| **CRUD Layer** | `backend/app/crud.py` — Full CRUD functions for all 4 entities | ✅ Done |
| **Routers** | `backend/app/routers/` — REST endpoints for users, incomes, goals, transactions (all CRUD) | ✅ Done |
| **App Entry** | `backend/app/main.py` — FastAPI app with CORS, router mounts, auto-create tables on startup | ✅ Done |
| **Requirements** | `backend/requirements.txt` — fastapi, uvicorn, sqlalchemy, pydantic | ✅ Done |

### Frontend — React + Vite PWA

| Layer | Files | Status |
|---|---|---|
| **PWA Setup** | `vite.config.js` — `vite-plugin-pwa` with manifest.json, standalone display, proxy to `localhost:8000` | ✅ Done |
| **API Client** | `frontend/src/api/client.js` — Axios-based CRUD functions for all 4 entities | ✅ Done |
| **App Component** | `frontend/src/App.jsx` — User list, CreateUserForm, GoalForm, TransactionForm (basic single-page scaffold) | ✅ Done |

---

## What's Left to Build (📋 TODO — in priority order)

### Phase 2: Manual Logging CRUD + Goal CRUD (basic forms completed, needs enhancement)
- [ ] Income source forms (frontend) — needs dedicated UI, currently missing
- [ ] Goal list view, edit/delete actions (frontend) — forms exist but no list/management UI
- [ ] Transaction list view, edit/delete actions (frontend)

### Phase 3: Score Calculation Endpoints
- [ ] `/users/{user_id}/scores` endpoint — Spending Score (Needs/Wants/Savings % against targets)
- [ ] `/users/{user_id}/scores` endpoint — Savings Score with band evaluation
- [ ] Net Income calculation endpoint
- [ ] Test with fixed sample data against the formulas:
  - `category_score = (amount spent in category / net_income) * 100`
  - `savings_score = (total_monthly_savings / net_income) * 100`
  - Needs target: 50%, Wants target: 30%, Savings & Investing target: 20%
  - Savings bands: <10% needs attention, 20-30% good, >=50% excellent

### Phase 4: Dashboard UI
- [x] Dashboard page with score cards
- [x] Spending Score category breakdown (pie/bar charts)
- [x] Savings Score with band indicator
- [x] Goal progress bars
- [x] React Router setup for navigation
- [x] Responsive mobile-first styling

### Phase 5: Onboarding Conversational Agent
- [x] LLM integration (function-calling provider)
- [x] Onboarding chat flow — extracts user name, income, goals into DB
- [x] Onboarding completion tracking

### Phase 6: Conversational Logging Agent
- [x] Transaction extraction from natural language
- [x] Category inference (ML Model/LLM decides, user can override)

### Phase 7: Pain-point / Coaching Chat (RAG-based)
- [ ] Fixed knowledge source for financial concepts
- [ ] Retrieval-augmented Q&A about SIP, lifestyle creep, tax regimes, etc.
- [ ] No-advice boundary enforcement

---

## Open Decisions (resolve before building)
- [x] Who assigns transaction category — user manually or agent infers? (info.txt says "ML Model (Naive Bayes)", but no NB model exists yet) -> **ML Model decides, user can override.**
- [x] Savings Score = same number as Savings & Investing category score, shown two ways? (info.txt says "Unified") -> **Shown as separate calculations.**
- [ ] Dev/run/test/lint commands (fill into AGENTS.md)
- [ ] Naming/commit conventions (fill into AGENTS.md)

## Run Commands
- **Backend:** `uvicorn app.main:app --reload` (from `backend/`)
- **Frontend:** `npm run dev` (from `frontend/`)
- **Frontend build:** `npm run build`
- **Frontend lint:** `npm run lint`
