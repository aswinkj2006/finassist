import enum
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class TransactionSource(str, enum.Enum):
    manual = "manual"
    SMS = "SMS"
    OCR = "OCR"
    chat = "chat"
    subscription = "subscription"
    recurring = "recurring"


class TransactionType(str, enum.Enum):
    expense = "expense"
    income = "income"
    transfer = "transfer"


class AccountType(str, enum.Enum):
    cash = "cash"
    bank = "bank"
    credit_card = "credit_card"
    wallet = "wallet"
    investment = "investment"


class BillingCycle(str, enum.Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    quarterly = "quarterly"
    yearly = "yearly"


class ItemStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    monthly_net_income = Column(Float, default=0.0)
    base_currency = Column(String, default="INR")
    onboarding_complete = Column(Boolean, default=False)

    income_sources = relationship("IncomeSource", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    recurring_items = relationship("RecurringTransaction", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    investments = relationship("Investment", back_populates="user", cascade="all, delete-orphan")
    debts = relationship("Debt", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    account_type = Column(String, default="bank") # cash, bank, credit_card, wallet, investment
    balance = Column(Float, default=0.0)
    currency = Column(String, default="INR")
    color = Column(String, default="#2563eb")
    icon = Column(String, default="Building2")
    is_default = Column(Boolean, default=False)

    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", foreign_keys="[Transaction.account_id]", back_populates="account")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # null if system default
    name = Column(String, nullable=False)
    icon = Column(String, default="Tag")
    color = Column(String, default="#6366f1")
    is_system = Column(Boolean, default=False)

    user = relationship("User", back_populates="categories")
    tags = relationship("Tag", back_populates="category", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="category_rel")
    budgets = relationship("Budget", back_populates="category_rel")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String, nullable=False)

    category = relationship("Category", back_populates="tags")


class IncomeSource(Base):
    __tablename__ = "income_sources"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    label = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    frequency = Column(String, nullable=False)

    user = relationship("User", back_populates="income_sources")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    target_date = Column(Date, nullable=True)
    saved_so_far = Column(Float, default=0.0)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)

    user = relationship("User", back_populates="goals")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String, default="expense") # expense, income, transfer
    category = Column(String, nullable=False, default="General") # category name string
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    subcategory = Column(String, default="") # legacy / sub-tag string
    tags = Column(String, default="") # comma-separated tags e.g. "Groceries,Organic"
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    destination_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True) # for transfers
    currency = Column(String, default="INR")
    note = Column(String, default="")
    date = Column(Date, nullable=False)
    source = Column(String, default="manual") # manual, SMS, OCR, chat, subscription, recurring

    user = relationship("User", back_populates="transactions")
    account = relationship("Account", foreign_keys=[account_id], back_populates="transactions")
    category_rel = relationship("Category", back_populates="transactions")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, default="Entertainment")
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    billing_cycle = Column(String, default="monthly") # weekly, monthly, quarterly, yearly
    start_date = Column(Date, nullable=False)
    next_due_date = Column(Date, nullable=False)
    status = Column(String, default="active") # active, paused, cancelled
    reminder_5d = Column(Boolean, default=True)
    reminder_1d = Column(Boolean, default=True)
    last_processed_date = Column(Date, nullable=True)

    user = relationship("User", back_populates="subscriptions")
    account = relationship("Account")


class RecurringTransaction(Base):
    __tablename__ = "recurring_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String, default="expense") # expense, income
    category = Column(String, default="General")
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    frequency = Column(String, default="monthly") # daily, weekly, monthly, custom
    start_date = Column(Date, nullable=False)
    next_due_date = Column(Date, nullable=False)
    status = Column(String, default="active")
    reminder_5d = Column(Boolean, default=True)
    reminder_1d = Column(Boolean, default=True)
    last_processed_date = Column(Date, nullable=True)

    user = relationship("User", back_populates="recurring_items")
    account = relationship("Account")


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    monthly_limit = Column(Float, nullable=False)
    month_year = Column(String, nullable=False) # e.g. "2026-08"
    alert_threshold = Column(Float, default=0.8) # 80% threshold
    envelope_allocated = Column(Float, default=0.0) # for envelope mode

    user = relationship("User", back_populates="budgets")
    category_rel = relationship("Category", back_populates="budgets")


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    asset_type = Column(String, default="mutual_fund") # SIP, stock, fixed_deposit, mutual_fund, gold, crypto
    invested_amount = Column(Float, default=0.0)
    current_value = Column(Float, default=0.0)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    notes = Column(String, default="")
    updated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="investments")


class Debt(Base):
    __tablename__ = "debts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    debt_type = Column(String, default="borrowed") # borrowed (I owe), lent (Owed to me)
    counterparty_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    settled_amount = Column(Float, default=0.0)
    due_date = Column(Date, nullable=True)
    notes = Column(String, default="")

    user = relationship("User", back_populates="debts")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    notif_type = Column(String, default="info") # bill_due_5d, bill_due_1d, overspend, anomaly, low_balance
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, default="New Conversation")
    created_at = Column(String, nullable=False)

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False) # 'user' or 'model'
    content = Column(Text, nullable=False)
    timestamp = Column(String, nullable=False)

    user = relationship("User", back_populates="chat_messages")
    session = relationship("ChatSession", back_populates="messages")
