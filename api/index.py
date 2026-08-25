import sys
import os

# Add the project root to the Python path so we can import from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import all the components from backend
from backend.app.database import engine, Base, SessionLocal
from backend.app import crud, schemas
from backend.app.routers import (
    users, incomes, goals, transactions, chat, auth,
    categories, accounts, subscriptions, recurring,
    budgets, investments, debts, notifications
)

app = FastAPI(title="FinAssist API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(accounts.router, prefix="/api")
app.include_router(subscriptions.router, prefix="/api")
app.include_router(recurring.router, prefix="/api")
app.include_router(budgets.router, prefix="/api")
app.include_router(investments.router, prefix="/api")
app.include_router(debts.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(incomes.router, prefix="/api")
app.include_router(goals.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        crud.seed_default_categories(db, user_id=None)
    finally:
        db.close()
