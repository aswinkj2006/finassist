from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import users, incomes, goals, transactions, chat, auth, categories, accounts, subscriptions, recurring, budgets, investments, debts, notifications

app = FastAPI(title="FinAssist API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(accounts.router)
app.include_router(subscriptions.router)
app.include_router(recurring.router)
app.include_router(budgets.router)
app.include_router(investments.router)
app.include_router(debts.router)
app.include_router(notifications.router)
app.include_router(incomes.router)
app.include_router(goals.router)
app.include_router(transactions.router)
app.include_router(chat.router)


@app.on_event("startup")
def on_startup():
    from .database import SessionLocal
    from . import crud
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        crud.seed_default_categories(db, user_id=None)
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}
