# AGENTS.md — FinAssist

## What this project is
FinAssist is a mobile-first PWA that helps first-time salaried earners in India
log spending, track savings goals, and see two computed financial health scores.
Onboarding and logging can happen either manually (forms) or conversationally
(chat with an AI agent that extracts structured data).

This is a semester mini-project built by a 4-person student team using OpenCode.
Scope discipline matters more than feature count — see "Out of scope" below.

## Stack (assumed — confirm with team before deviating)
- Backend: FastAPI (Python)
- Frontend: React + Vite, built as an installable PWA (manifest.json + service worker)
- DB: SQLite for development
- LLM: any provider with function-calling / tool-use support, used for:
  - onboarding conversation (extracts structured fields)
  - conversational logging (extracts a transaction from natural language)
  - goal/pain-point chat (soft, educational — see scope rules)
- Auth: none required for MVP — single local user profile is acceptable unless
  the team explicitly adds multi-user login

## Core data model (lock this before building — all 4 members build against it)
- `users`: id, name, monthly_net_income, onboarding_complete (bool)
- `income_sources`: id, user_id, label, amount, frequency
- `goals`: id, user_id, title, target_amount, target_date, saved_so_far
- `transactions`: id, user_id, amount, category (enum: needs | wants | savings_investing),
  subcategory (free text, e.g. "rent", "dining out"), note, date, source (enum: manual | chat)

## Scores — exact formulas, do not deviate without team sign-off
**Net Income** = Gross salary − mandatory deductions (TDS, EPF, professional tax)

**Spending Score (three category scores, each a %):**
category_score = (amount spent in category / net_income) * 100
- Needs target: 50%   (rent/EMI, groceries, utilities, minimum debt, basic transport)
- Wants target: 30%   (dining out, entertainment, hobbies, shopping, vacations)
- Savings & Investing target: 20% (emergency fund, retirement, investments, debt principal)
Evaluation: category over its target % = flag it (e.g. Needs > 50% = "lifestyle inflated",
Wants > 30% = "lifestyle creep"). Do not word this as a moral judgment in the UI —
state the number and the target, let the user draw the conclusion.

**Savings Score:**
savings_score = (total_monthly_savings / net_income) * 100
Bands: <10% = needs attention, 20-30% = good (long-term stability benchmark),
>=50% = excellent (early retirement / FI pace)

Every transaction must have a category (needs/wants/savings_investing) for these
scores to compute. Decide once: user picks category manually, or the logging
agent infers it — do not let this be ambiguous per-feature.

## Conversational agent scope — hard boundaries
- Onboarding and goal-setting chat: extracts structured data (income, goals, target
  amounts/dates) into the DB. This is data collection, not advice.
- Pain-point / coaching chat: may explain concepts (what an SIP is, what "lifestyle
  creep" means) using retrieval over a fixed, versioned knowledge source.
- The agent must NEVER: recommend a specific fund/stock, give a personalized asset
  allocation percentage, or state a definitive tax filing recommendation. Explain
  concepts and show the user's own numbers against general benchmarks — never
  tell them what to do with their money.
- No live bank/loan/credit API integration in this project. All financial data is
  user-entered (manually or via chat), never pulled from a live account.

## Out of scope for this semester project
- Live bank/Account Aggregator integration
- Investment/tax advice beyond educational explanation (see above)
- Multi-user auth/roles beyond a single profile per install
- Native mobile app — PWA only

## Build order (do not parallelize out of this order within a module)
1. DB schema + models + migrations
2. Manual logging CRUD + goal CRUD (backend), basic forms (frontend)
3. Score calculation endpoints, tested against the formulas above with fixed sample data
4. Dashboard UI (scores, category breakdown, goal progress)
5. Onboarding conversational agent (income, goals extraction)
6. Conversational logging agent (transaction extraction)
7. Pain-point/coaching chat (retrieval-based, last — highest risk of scope creep)

## Commands
- **Backend (FastAPI):** `fastapi dev app/main.py` or `uvicorn app.main:app --reload`
- **Frontend (React+Vite):** `npm run dev`

## Conventions
- **Commits:** Conventional Commits (e.g., `feat: ...`, `fix: ...`)
- **Naming:** `snake_case` for Python backend files/variables, `camelCase` for JS variables/functions, `PascalCase` for React components.
