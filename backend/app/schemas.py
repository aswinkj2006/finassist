from datetime import date, datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict


# ─── USER SCHEMAS ───────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    monthly_net_income: float = 0.0
    base_currency: str = "INR"
    onboarding_complete: bool = False


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserRead(BaseModel):
    id: int
    name: str
    email: str
    monthly_net_income: float
    base_currency: str = "INR"
    onboarding_complete: bool

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    monthly_net_income: Optional[float] = None
    base_currency: Optional[str] = None
    onboarding_complete: Optional[bool] = None


# ─── ACCOUNT SCHEMAS ─────────────────────────────────────────

class AccountCreate(BaseModel):
    name: str
    account_type: str = "bank" # cash, bank, credit_card, wallet, investment
    balance: float = 0.0
    currency: str = "INR"
    color: str = "#2563eb"
    icon: str = "Building2"
    is_default: bool = False


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    account_type: Optional[str] = None
    balance: Optional[float] = None
    currency: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    is_default: Optional[bool] = None


class AccountRead(BaseModel):
    id: int
    user_id: int
    name: str
    account_type: str
    balance: float
    currency: str
    color: str
    icon: str
    is_default: bool

    model_config = ConfigDict(from_attributes=True)


class NetWorthSummary(BaseModel):
    total_net_worth: float
    total_assets: float
    total_liabilities: float
    base_currency: str
    accounts: List[AccountRead]


# ─── CATEGORY & TAG SCHEMAS ──────────────────────────────────

class TagCreate(BaseModel):
    name: str


class TagRead(BaseModel):
    id: int
    category_id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class CategoryCreate(BaseModel):
    name: str
    icon: str = "Tag"
    color: str = "#6366f1"
    tags: Optional[List[str]] = []


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class CategoryRead(BaseModel):
    id: int
    user_id: Optional[int] = None
    name: str
    icon: str
    color: str
    is_system: bool
    tags: List[TagRead] = []

    model_config = ConfigDict(from_attributes=True)


# ─── INCOME SOURCE SCHEMAS ───────────────────────────────────

class IncomeSourceCreate(BaseModel):
    label: str
    amount: float
    frequency: str = "monthly"


class IncomeSourceRead(BaseModel):
    id: int
    user_id: int
    label: str
    amount: float
    frequency: str

    model_config = ConfigDict(from_attributes=True)


class IncomeSourceUpdate(BaseModel):
    label: Optional[str] = None
    amount: Optional[float] = None
    frequency: Optional[str] = None


# ─── GOAL SCHEMAS ────────────────────────────────────────────

class GoalCreate(BaseModel):
    title: str
    target_amount: float
    target_date: Optional[date] = None
    saved_so_far: float = 0.0
    account_id: Optional[int] = None


class GoalRead(BaseModel):
    id: int
    user_id: int
    title: str
    target_amount: float
    target_date: Optional[date] = None
    saved_so_far: float
    account_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = None
    target_date: Optional[date] = None
    saved_so_far: Optional[float] = None
    account_id: Optional[int] = None


# ─── TRANSACTION SCHEMAS ─────────────────────────────────────

class TransactionCreate(BaseModel):
    amount: float
    transaction_type: str = "expense" # expense, income, transfer
    category: str = "General"
    category_id: Optional[int] = None
    subcategory: Optional[str] = ""
    tags: Optional[str] = ""
    account_id: Optional[int] = None
    destination_account_id: Optional[int] = None
    currency: str = "INR"
    note: Optional[str] = ""
    date: date
    source: str = "manual"


class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    transaction_type: Optional[str] = None
    category: Optional[str] = None
    category_id: Optional[int] = None
    subcategory: Optional[str] = None
    tags: Optional[str] = None
    account_id: Optional[int] = None
    destination_account_id: Optional[int] = None
    currency: Optional[str] = None
    note: Optional[str] = None
    date: Optional[date] = None
    source: Optional[str] = None


class TransactionRead(BaseModel):
    id: int
    user_id: int
    amount: float
    transaction_type: str
    category: str
    category_id: Optional[int] = None
    subcategory: str
    tags: str
    account_id: Optional[int] = None
    destination_account_id: Optional[int] = None
    currency: str
    note: str
    date: date
    source: str

    model_config = ConfigDict(from_attributes=True)


# ─── SUBSCRIPTIONS & RECURRING SCHEMAS ───────────────────────

class SubscriptionCreate(BaseModel):
    name: str
    amount: float
    category: str = "Entertainment"
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    billing_cycle: str = "monthly" # weekly, monthly, quarterly, yearly
    start_date: date
    next_due_date: date
    status: str = "active" # active, paused, cancelled
    reminder_5d: bool = True
    reminder_1d: bool = True


class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    billing_cycle: Optional[str] = None
    start_date: Optional[date] = None
    next_due_date: Optional[date] = None
    status: Optional[str] = None
    reminder_5d: Optional[bool] = None
    reminder_1d: Optional[bool] = None


class SubscriptionRead(BaseModel):
    id: int
    user_id: int
    name: str
    amount: float
    category: str
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    billing_cycle: str
    start_date: date
    next_due_date: date
    status: str
    reminder_5d: bool
    reminder_1d: bool
    last_processed_date: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)


class RecurringCreate(BaseModel):
    name: str
    amount: float
    transaction_type: str = "expense" # income, expense
    category: str = "General"
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    frequency: str = "monthly"
    start_date: date
    next_due_date: date
    status: str = "active"
    reminder_5d: bool = True
    reminder_1d: bool = True


class RecurringUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    transaction_type: Optional[str] = None
    category: Optional[str] = None
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    next_due_date: Optional[date] = None
    status: Optional[str] = None
    reminder_5d: Optional[bool] = None
    reminder_1d: Optional[bool] = None


class RecurringRead(BaseModel):
    id: int
    user_id: int
    name: str
    amount: float
    transaction_type: str
    category: str
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    frequency: str
    start_date: date
    next_due_date: date
    status: str
    reminder_5d: bool
    reminder_1d: bool
    last_processed_date: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)


# ─── BUDGET SCHEMAS ──────────────────────────────────────────

class BudgetCreate(BaseModel):
    category: str
    category_id: Optional[int] = None
    monthly_limit: float
    month_year: str # "2026-08"
    alert_threshold: float = 0.8
    envelope_allocated: float = 0.0


class BudgetUpdate(BaseModel):
    monthly_limit: Optional[float] = None
    alert_threshold: Optional[float] = None
    envelope_allocated: Optional[float] = None


class BudgetRead(BaseModel):
    id: int
    user_id: int
    category: str
    category_id: Optional[int] = None
    monthly_limit: float
    month_year: str
    alert_threshold: float
    envelope_allocated: float
    spent_so_far: float = 0.0
    percentage_used: float = 0.0
    is_overbudget: bool = False

    model_config = ConfigDict(from_attributes=True)


# ─── INVESTMENT & DEBT SCHEMAS ───────────────────────────────

class InvestmentCreate(BaseModel):
    name: str
    asset_type: str = "mutual_fund" # SIP, stock, fixed_deposit, mutual_fund, gold, crypto
    invested_amount: float
    current_value: float
    account_id: Optional[int] = None
    notes: Optional[str] = ""


class InvestmentUpdate(BaseModel):
    name: Optional[str] = None
    asset_type: Optional[str] = None
    invested_amount: Optional[float] = None
    current_value: Optional[float] = None
    account_id: Optional[int] = None
    notes: Optional[str] = None


class InvestmentRead(BaseModel):
    id: int
    user_id: int
    name: str
    asset_type: str
    invested_amount: float
    current_value: float
    account_id: Optional[int] = None
    notes: str
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DebtCreate(BaseModel):
    debt_type: str = "borrowed" # borrowed (I owe), lent (Owed to me)
    counterparty_name: str
    amount: float
    settled_amount: float = 0.0
    due_date: Optional[date] = None
    notes: Optional[str] = ""


class DebtUpdate(BaseModel):
    counterparty_name: Optional[str] = None
    amount: Optional[float] = None
    settled_amount: Optional[float] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None


class DebtRead(BaseModel):
    id: int
    user_id: int
    debt_type: str
    counterparty_name: str
    amount: float
    settled_amount: float
    due_date: Optional[date] = None
    notes: str

    model_config = ConfigDict(from_attributes=True)


# ─── NOTIFICATION SCHEMAS ────────────────────────────────────

class NotificationRead(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notif_type: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── DASHBOARD & INSIGHTS SCHEMAS ────────────────────────────

class CategoryPillStat(BaseModel):
    category_id: Optional[int] = None
    name: str
    icon: str
    color: str
    spend_this_month: float
    percentage_of_total: float
    prev_month_spend: float
    trend_percentage: float # e.g. +4.5% or -2.0%
    subtags_breakdown: List[dict] = [] # [{"name": "Groceries", "amount": 2500, "pct": 60}]
    budget_limit: Optional[float] = None
    budget_used_pct: Optional[float] = None


class MonthTrendStat(BaseModel):
    month_name: str # e.g. "Jul", "Aug"
    month_key: str  # "2026-07"
    income: float
    expense: float
    savings: float


class AnomalyItem(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    date: date
    reason: str # "4x higher than average for Food"


class DashboardStats(BaseModel):
    net_worth: float
    total_assets: float
    total_liabilities: float
    total_income_this_month: float
    total_expense_this_month: float
    savings_rate: float
    category_pills: List[CategoryPillStat] # Top 6 categories for 2x3 grid
    all_category_stats: List[CategoryPillStat]
    monthly_trends: List[MonthTrendStat]
    anomalies: List[AnomalyItem]
    upcoming_reminders: List[dict] # 5d & 1d due reminders
    budgets: List[BudgetRead]
    accounts: List[AccountRead]


# ─── CHAT SCHEMAS ────────────────────────────────────────────

class ChatSessionCreate(BaseModel):
    title: str = "New Conversation"
    created_at: str


class ChatSessionRead(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class ChatMessageCreate(BaseModel):
    session_id: int
    role: str
    content: str
    timestamp: str


class ChatMessageRead(BaseModel):
    id: int
    session_id: int
    user_id: int
    role: str
    content: str
    timestamp: str

    model_config = ConfigDict(from_attributes=True)
