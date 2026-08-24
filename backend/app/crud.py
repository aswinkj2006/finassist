from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from . import models, schemas
from datetime import datetime, date, timedelta
import calendar
import bcrypt

def add_months_to_date(source_date: date, months: int) -> date:
    """Adds or subtracts months to a date without external dependencies."""
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    max_day = calendar.monthrange(year, month)[1]
    day = min(source_date.day, max_day)
    return date(year, month, day)

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


# ─── DEFAULT CATEGORIES SEEDING ──────────────────────────────

DEFAULT_SYSTEM_CATEGORIES = [
    {
        "name": "Food",
        "icon": "Utensils",
        "color": "#f97316",
        "tags": ["Groceries", "Dining Out", "Delivery", "Coffee & Snacks", "Alcohol"]
    },
    {
        "name": "Petrol/Fuel",
        "icon": "Fuel",
        "color": "#ef4444",
        "tags": ["Petrol", "Diesel", "EV Charging", "CNG"]
    },
    {
        "name": "Rent",
        "icon": "Home",
        "color": "#8b5cf6",
        "tags": ["House Rent", "Maintenance", "Hostel/PG", "Parking"]
    },
    {
        "name": "Transport",
        "icon": "Car",
        "color": "#06b6d4",
        "tags": ["Metro", "Bus", "Cab/Auto", "Train", "Flight"]
    },
    {
        "name": "Utilities",
        "icon": "Zap",
        "color": "#eab308",
        "tags": ["Electricity", "Water", "Wifi/Internet", "Mobile Recharge", "LPG Gas"]
    },
    {
        "name": "Shopping",
        "icon": "ShoppingBag",
        "color": "#ec4899",
        "tags": ["Clothing", "Electronics", "Home & Kitchen", "Gifts", "Personal Care"]
    },
    {
        "name": "Entertainment",
        "icon": "Film",
        "color": "#6366f1",
        "tags": ["Movies", "Games", "Concerts", "Events", "Outing"]
    },
    {
        "name": "Healthcare",
        "icon": "HeartPulse",
        "color": "#10b981",
        "tags": ["Medicines", "Doctor Consultations", "Lab Tests", "Hospital", "Gym/Fitness"]
    },
    {
        "name": "General",
        "icon": "Package",
        "color": "#64748b",
        "tags": ["Miscellaneous", "Cash Withdrawal", "Fees", "Charity"]
    }
]

def seed_default_categories(db: Session, user_id: int | None = None):
    """Seed default system categories and their sub-tags."""
    for item in DEFAULT_SYSTEM_CATEGORIES:
        exists = db.query(models.Category).filter(
            models.Category.name == item["name"],
            models.Category.user_id == user_id
        ).first()
        if not exists:
            cat = models.Category(
                user_id=user_id,
                name=item["name"],
                icon=item["icon"],
                color=item["color"],
                is_system=True if user_id is None else False
            )
            db.add(cat)
            db.flush()
            for tag_name in item["tags"]:
                tag = models.Tag(
                    user_id=user_id,
                    category_id=cat.id,
                    name=tag_name
                )
                db.add(tag)
    db.commit()


# ─── USER CRUD ───────────────────────────────────────────────

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        monthly_net_income=user.monthly_net_income,
        base_currency=user.base_currency,
        onboarding_complete=user.onboarding_complete
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Automatically create default Cash and Main Bank Accounts for the user
    acc1 = models.Account(
        user_id=db_user.id,
        name="Main Bank",
        account_type="bank",
        balance=0.0,
        currency=user.base_currency,
        color="#2563eb",
        icon="Building2",
        is_default=True
    )
    acc2 = models.Account(
        user_id=db_user.id,
        name="Cash in Hand",
        account_type="cash",
        balance=0.0,
        currency=user.base_currency,
        color="#10b981",
        icon="Wallet",
        is_default=False
    )
    db.add(acc1)
    db.add(acc2)
    db.commit()

    # Seed user specific categories copy or ensure system categories exist
    seed_default_categories(db, user_id=None)
    return db_user


def get_user(db: Session, user_id: int) -> models.User | None:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()


def update_user(db: Session, user_id: int, updates: schemas.UserUpdate) -> models.User | None:
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    for key, val in updates.model_dump(exclude_unset=True).items():
        if key == "password" and val:
            setattr(db_user, "password_hash", get_password_hash(val))
        else:
            setattr(db_user, key, val)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True


# ─── CATEGORY & TAG CRUD ─────────────────────────────────────

def get_categories(db: Session, user_id: int) -> list[models.Category]:
    # Returns both global system categories and user custom categories
    return db.query(models.Category).filter(
        or_(models.Category.user_id == user_id, models.Category.user_id == None)
    ).all()


def create_category(db: Session, user_id: int, cat: schemas.CategoryCreate) -> models.Category:
    db_cat = models.Category(
        user_id=user_id,
        name=cat.name,
        icon=cat.icon,
        color=cat.color,
        is_system=False
    )
    db.add(db_cat)
    db.flush()
    if cat.tags:
        for t in cat.tags:
            tag = models.Tag(user_id=user_id, category_id=db_cat.id, name=t)
            db.add(tag)
    db.commit()
    db.refresh(db_cat)
    return db_cat


def update_category(db: Session, category_id: int, updates: schemas.CategoryUpdate) -> models.Category | None:
    db_cat = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_cat:
        return None
    for key, val in updates.model_dump(exclude_unset=True).items():
        setattr(db_cat, key, val)
    db.commit()
    db.refresh(db_cat)
    return db_cat


def delete_category(db: Session, category_id: int) -> bool:
    db_cat = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_cat:
        return False
    db.delete(db_cat)
    db.commit()
    return True


def create_tag(db: Session, user_id: int, category_id: int, tag: schemas.TagCreate) -> models.Tag:
    db_tag = models.Tag(user_id=user_id, category_id=category_id, name=tag.name)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


# ─── ACCOUNT CRUD ────────────────────────────────────────────

def get_accounts(db: Session, user_id: int) -> list[models.Account]:
    return db.query(models.Account).filter(models.Account.user_id == user_id).all()


def get_account(db: Session, account_id: int) -> models.Account | None:
    return db.query(models.Account).filter(models.Account.id == account_id).first()


def create_account(db: Session, user_id: int, account: schemas.AccountCreate) -> models.Account:
    if account.is_default:
        db.query(models.Account).filter(models.Account.user_id == user_id).update({"is_default": False})
    db_acc = models.Account(user_id=user_id, **account.model_dump())
    db.add(db_acc)
    db.commit()
    db.refresh(db_acc)
    return db_acc


def update_account(db: Session, account_id: int, updates: schemas.AccountUpdate) -> models.Account | None:
    db_acc = get_account(db, account_id)
    if not db_acc:
        return None
    if updates.is_default:
        db.query(models.Account).filter(models.Account.user_id == db_acc.user_id).update({"is_default": False})
    for key, val in updates.model_dump(exclude_unset=True).items():
        setattr(db_acc, key, val)
    db.commit()
    db.refresh(db_acc)
    return db_acc


def delete_account(db: Session, account_id: int) -> bool:
    db_acc = get_account(db, account_id)
    if not db_acc:
        return False
    db.delete(db_acc)
    db.commit()
    return True


def get_net_worth_summary(db: Session, user_id: int) -> schemas.NetWorthSummary:
    user = get_user(db, user_id)
    base_curr = user.base_currency if user else "INR"
    accounts = get_accounts(db, user_id)
    
    total_assets = 0.0
    total_liabilities = 0.0

    for acc in accounts:
        # Credit cards count towards liabilities if negative or balance represents debt
        if acc.account_type == "credit_card":
            if acc.balance < 0:
                total_liabilities += abs(acc.balance)
            else:
                total_liabilities += acc.balance
        else:
            if acc.balance >= 0:
                total_assets += acc.balance
            else:
                total_liabilities += abs(acc.balance)

    # Include investments in assets
    investments = db.query(models.Investment).filter(models.Investment.user_id == user_id).all()
    for inv in investments:
        total_assets += inv.current_value

    # Include debts
    debts = db.query(models.Debt).filter(models.Debt.user_id == user_id).all()
    for d in debts:
        remaining = max(0.0, d.amount - d.settled_amount)
        if d.debt_type == "borrowed":
            total_liabilities += remaining
        elif d.debt_type == "lent":
            total_assets += remaining

    net_worth = total_assets - total_liabilities

    return schemas.NetWorthSummary(
        total_net_worth=net_worth,
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        base_currency=base_curr,
        accounts=accounts
    )


# ─── TRANSACTION CRUD & BALANCE SYNC ─────────────────────────

def adjust_account_balance(db: Session, account_id: int | None, amount: float, tx_type: str, is_revert: bool = False):
    if not account_id:
        return
    acc = get_account(db, account_id)
    if not acc:
        return
    
    multiplier = -1 if is_revert else 1

    if tx_type == "expense":
        acc.balance -= (amount * multiplier)
    elif tx_type == "income":
        acc.balance += (amount * multiplier)


def create_transaction(db: Session, user_id: int, tx: schemas.TransactionCreate) -> models.Transaction:
    # If account_id not provided, assign user's default account
    acc_id = tx.account_id
    if not acc_id:
        default_acc = db.query(models.Account).filter(
            models.Account.user_id == user_id,
            models.Account.is_default == True
        ).first()
        if not default_acc:
            default_acc = db.query(models.Account).filter(models.Account.user_id == user_id).first()
        if default_acc:
            acc_id = default_acc.id

    db_tx = models.Transaction(
        user_id=user_id,
        amount=tx.amount,
        transaction_type=tx.transaction_type,
        category=tx.category,
        category_id=tx.category_id,
        subcategory=tx.subcategory or "",
        tags=tx.tags or "",
        account_id=acc_id,
        destination_account_id=tx.destination_account_id,
        currency=tx.currency,
        note=tx.note or "",
        date=tx.date,
        source=tx.source
    )
    db.add(db_tx)
    
    # Adjust balance
    if tx.transaction_type == "transfer":
        if acc_id:
            adjust_account_balance(db, acc_id, tx.amount, "expense")
        if tx.destination_account_id:
            adjust_account_balance(db, tx.destination_account_id, tx.amount, "income")
    else:
        adjust_account_balance(db, acc_id, tx.amount, tx.transaction_type)

    db.commit()
    db.refresh(db_tx)

    # Check budget alerts for this category
    check_budget_overspend(db, user_id, tx.category, tx.date)

    return db_tx


def get_transactions(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    category: str = None,
    account_id: int = None,
    tag: str = None,
    transaction_type: str = None,
    min_amount: float = None,
    max_amount: float = None,
    start_date: date = None,
    end_date: date = None,
    days_ago: int = None
) -> list[models.Transaction]:
    query = db.query(models.Transaction).filter(models.Transaction.user_id == user_id)
    
    if search:
        query = query.filter(
            or_(
                models.Transaction.note.ilike(f"%{search}%"),
                models.Transaction.subcategory.ilike(f"%{search}%"),
                models.Transaction.category.ilike(f"%{search}%"),
                models.Transaction.tags.ilike(f"%{search}%")
            )
        )
    if category and category.lower() != "all":
        query = query.filter(models.Transaction.category.ilike(category))
    if account_id:
        query = query.filter(models.Transaction.account_id == account_id)
    if tag:
        query = query.filter(models.Transaction.tags.ilike(f"%{tag}%"))
    if transaction_type and transaction_type.lower() != "all":
        query = query.filter(models.Transaction.transaction_type == transaction_type)
    if min_amount is not None:
        query = query.filter(models.Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(models.Transaction.amount <= max_amount)
    if start_date:
        query = query.filter(models.Transaction.date >= start_date)
    if end_date:
        query = query.filter(models.Transaction.date <= end_date)
    if days_ago is not None:
        cutoff = date.today() - timedelta(days=days_ago)
        query = query.filter(models.Transaction.date >= cutoff)
        
    return query.order_by(models.Transaction.date.desc(), models.Transaction.id.desc()).offset(skip).limit(limit).all()


def get_transaction(db: Session, tx_id: int) -> models.Transaction | None:
    return db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()


def update_transaction(db: Session, tx_id: int, updates: schemas.TransactionUpdate) -> models.Transaction | None:
    db_tx = get_transaction(db, tx_id)
    if not db_tx:
        return None
    
    # Revert previous balance impact
    adjust_account_balance(db, db_tx.account_id, db_tx.amount, db_tx.transaction_type, is_revert=True)
    if db_tx.transaction_type == "transfer" and db_tx.destination_account_id:
        adjust_account_balance(db, db_tx.destination_account_id, db_tx.amount, "income", is_revert=True)

    # Apply updates
    for key, val in updates.model_dump(exclude_unset=True).items():
        setattr(db_tx, key, val)

    # Apply new balance impact
    if db_tx.transaction_type == "transfer":
        if db_tx.account_id:
            adjust_account_balance(db, db_tx.account_id, db_tx.amount, "expense")
        if db_tx.destination_account_id:
            adjust_account_balance(db, db_tx.destination_account_id, db_tx.amount, "income")
    else:
        adjust_account_balance(db, db_tx.account_id, db_tx.amount, db_tx.transaction_type)

    db.commit()
    db.refresh(db_tx)
    return db_tx


def delete_transaction(db: Session, tx_id: int) -> bool:
    db_tx = get_transaction(db, tx_id)
    if not db_tx:
        return False
    adjust_account_balance(db, db_tx.account_id, db_tx.amount, db_tx.transaction_type, is_revert=True)
    if db_tx.transaction_type == "transfer" and db_tx.destination_account_id:
        adjust_account_balance(db, db_tx.destination_account_id, db_tx.amount, "income", is_revert=True)
    db.delete(db_tx)
    db.commit()
    return True


# ─── SUBSCRIPTIONS & RECURRING ENGINE ────────────────────────

def calculate_next_due_date(current_due: date, cycle: str) -> date:
    if cycle == "weekly":
        return current_due + timedelta(days=7)
    elif cycle == "quarterly":
        return add_months_to_date(current_due, 3)
    elif cycle == "yearly":
        return add_months_to_date(current_due, 12)
    elif cycle == "daily":
        return current_due + timedelta(days=1)
    else: # monthly default
        return add_months_to_date(current_due, 1)


def create_subscription(db: Session, user_id: int, sub: schemas.SubscriptionCreate) -> models.Subscription:
    db_sub = models.Subscription(user_id=user_id, **sub.model_dump())
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub


def get_subscriptions(db: Session, user_id: int) -> list[models.Subscription]:
    return db.query(models.Subscription).filter(models.Subscription.user_id == user_id).all()


def update_subscription(db: Session, sub_id: int, updates: schemas.SubscriptionUpdate) -> models.Subscription | None:
    db_sub = db.query(models.Subscription).filter(models.Subscription.id == sub_id).first()
    if not db_sub:
        return None
    for key, val in updates.model_dump(exclude_unset=True).items():
        setattr(db_sub, key, val)
    db.commit()
    db.refresh(db_sub)
    return db_sub


def delete_subscription(db: Session, sub_id: int) -> bool:
    db_sub = db.query(models.Subscription).filter(models.Subscription.id == sub_id).first()
    if not db_sub:
        return False
    db.delete(db_sub)
    db.commit()
    return True


def create_recurring(db: Session, user_id: int, item: schemas.RecurringCreate) -> models.RecurringTransaction:
    db_rec = models.RecurringTransaction(user_id=user_id, **item.model_dump())
    db.add(db_rec)
    db.commit()
    db.refresh(db_rec)
    return db_rec


def get_recurring_items(db: Session, user_id: int) -> list[models.RecurringTransaction]:
    return db.query(models.RecurringTransaction).filter(models.RecurringTransaction.user_id == user_id).all()


def update_recurring(db: Session, rec_id: int, updates: schemas.RecurringUpdate) -> models.RecurringTransaction | None:
    db_rec = db.query(models.RecurringTransaction).filter(models.RecurringTransaction.id == rec_id).first()
    if not db_rec:
        return None
    for key, val in updates.model_dump(exclude_unset=True).items():
        setattr(db_rec, key, val)
    db.commit()
    db.refresh(db_rec)
    return db_rec


def delete_recurring(db: Session, rec_id: int) -> bool:
    db_rec = db.query(models.RecurringTransaction).filter(models.RecurringTransaction.id == rec_id).first()
    if not db_rec:
        return False
    db.delete(db_rec)
    db.commit()
    return True


def process_due_subscriptions_and_recurring(db: Session, user_id: int):
    """
    Scans active subscriptions & recurring items.
    1. Auto-logs transaction entries for due items.
    2. Advances next_due_date.
    3. Generates 5-day and 1-day reminders.
    """
    today = date.today()

    # 1. Process Subscriptions
    subs = db.query(models.Subscription).filter(
        models.Subscription.user_id == user_id,
        models.Subscription.status == "active"
    ).all()

    for s in subs:
        # Check if due for auto-entry
        if s.next_due_date <= today:
            # Auto generate transaction
            tx = schemas.TransactionCreate(
                amount=s.amount,
                transaction_type="expense",
                category=s.category,
                category_id=s.category_id,
                account_id=s.account_id,
                note=f"Subscription: {s.name}",
                date=s.next_due_date,
                source="subscription"
            )
            create_transaction(db, user_id, tx)
            s.last_processed_date = today
            s.next_due_date = calculate_next_due_date(s.next_due_date, s.billing_cycle)
            db.commit()

        # Check due reminders (5 days and 1 day)
        days_left = (s.next_due_date - today).days
        if days_left == 5 and s.reminder_5d:
            create_notification(db, user_id, "Subscription Due in 5 Days", f"{s.name} (₹{s.amount:,.2f}) will be charged on {s.next_due_date}", "bill_due_5d")
        elif days_left == 1 and s.reminder_1d:
            create_notification(db, user_id, "Subscription Due Tomorrow!", f"{s.name} (₹{s.amount:,.2f}) is due tomorrow on {s.next_due_date}", "bill_due_1d")

    # 2. Process Recurring Transactions
    recs = db.query(models.RecurringTransaction).filter(
        models.RecurringTransaction.user_id == user_id,
        models.RecurringTransaction.status == "active"
    ).all()

    for r in recs:
        if r.next_due_date <= today:
            tx = schemas.TransactionCreate(
                amount=r.amount,
                transaction_type=r.transaction_type,
                category=r.category,
                category_id=r.category_id,
                account_id=r.account_id,
                note=f"Recurring: {r.name}",
                date=r.next_due_date,
                source="recurring"
            )
            create_transaction(db, user_id, tx)
            r.last_processed_date = today
            r.next_due_date = calculate_next_due_date(r.next_due_date, r.frequency)
            db.commit()

        days_left = (r.next_due_date - today).days
        if days_left == 5 and r.reminder_5d:
            create_notification(db, user_id, "Upcoming Bill in 5 Days", f"{r.name} (₹{r.amount:,.2f}) is due on {r.next_due_date}", "bill_due_5d")
        elif days_left == 1 and r.reminder_1d:
            create_notification(db, user_id, "Upcoming Bill Tomorrow!", f"{r.name} (₹{r.amount:,.2f}) is due tomorrow on {r.next_due_date}", "bill_due_1d")


# ─── BUDGET CRUD & OVERSPEND CHECKS ──────────────────────────

def create_budget(db: Session, user_id: int, budget: schemas.BudgetCreate) -> models.Budget:
    # Upsert budget for category + month
    existing = db.query(models.Budget).filter(
        models.Budget.user_id == user_id,
        models.Budget.category == budget.category,
        models.Budget.month_year == budget.month_year
    ).first()
    if existing:
        existing.monthly_limit = budget.monthly_limit
        existing.alert_threshold = budget.alert_threshold
        existing.envelope_allocated = budget.envelope_allocated
        db.commit()
        db.refresh(existing)
        return existing

    db_b = models.Budget(user_id=user_id, **budget.model_dump())
    db.add(db_b)
    db.commit()
    db.refresh(db_b)
    return db_b


def get_budgets(db: Session, user_id: int, month_year: str = None) -> list[schemas.BudgetRead]:
    if not month_year:
        month_year = date.today().strftime("%Y-%m")
    
    budgets = db.query(models.Budget).filter(
        models.Budget.user_id == user_id,
        models.Budget.month_year == month_year
    ).all()

    # Calculate actual spend for each budget category in this month
    start_date = datetime.strptime(month_year, "%Y-%m").date()
    end_date = add_months_to_date(start_date, 1) - timedelta(days=1)

    results = []
    for b in budgets:
        spent = db.query(func.sum(models.Transaction.amount)).filter(
            models.Transaction.user_id == user_id,
            models.Transaction.transaction_type == "expense",
            models.Transaction.category.ilike(b.category),
            models.Transaction.date >= start_date,
            models.Transaction.date <= end_date
        ).scalar() or 0.0

        pct = (spent / b.monthly_limit * 100) if b.monthly_limit > 0 else 0.0
        is_over = spent >= b.monthly_limit

        results.append(schemas.BudgetRead(
            id=b.id,
            user_id=b.user_id,
            category=b.category,
            category_id=b.category_id,
            monthly_limit=b.monthly_limit,
            month_year=b.month_year,
            alert_threshold=b.alert_threshold,
            envelope_allocated=b.envelope_allocated,
            spent_so_far=spent,
            percentage_used=pct,
            is_overbudget=is_over
        ))
    return results


def check_budget_overspend(db: Session, user_id: int, category: str, tx_date: date):
    month_year = tx_date.strftime("%Y-%m")
    budget = db.query(models.Budget).filter(
        models.Budget.user_id == user_id,
        models.Budget.category.ilike(category),
        models.Budget.month_year == month_year
    ).first()
    if not budget or budget.monthly_limit <= 0:
        return

    start_date = datetime.strptime(month_year, "%Y-%m").date()
    end_date = add_months_to_date(start_date, 1) - timedelta(days=1)

    spent = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.transaction_type == "expense",
        models.Transaction.category.ilike(category),
        models.Transaction.date >= start_date,
        models.Transaction.date <= end_date
    ).scalar() or 0.0

    ratio = spent / budget.monthly_limit
    if ratio >= 1.0:
        create_notification(
            db, user_id,
            f"Overspend Alert: {category}",
            f"You have exceeded your monthly budget for {category}! Spent ₹{spent:,.2f} of ₹{budget.monthly_limit:,.2f}",
            "overspend"
        )
    elif ratio >= budget.alert_threshold:
        create_notification(
            db, user_id,
            f"Budget Warning: {category}",
            f"You have used {ratio*100:.0f}% of your monthly budget for {category} (₹{spent:,.2f} / ₹{budget.monthly_limit:,.2f})",
            "overspend"
        )


# ─── INVESTMENTS & DEBTS ─────────────────────────────────────

def create_investment(db: Session, user_id: int, inv: schemas.InvestmentCreate) -> models.Investment:
    db_inv = models.Investment(user_id=user_id, **inv.model_dump())
    db.add(db_inv)
    db.commit()
    db.refresh(db_inv)
    return db_inv


def get_investments(db: Session, user_id: int) -> list[models.Investment]:
    return db.query(models.Investment).filter(models.Investment.user_id == user_id).all()


def update_investment(db: Session, inv_id: int, updates: schemas.InvestmentUpdate) -> models.Investment | None:
    db_inv = db.query(models.Investment).filter(models.Investment.id == inv_id).first()
    if not db_inv:
        return None
    for key, val in updates.model_dump(exclude_unset=True).items():
        setattr(db_inv, key, val)
    db_inv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_inv)
    return db_inv


def delete_investment(db: Session, inv_id: int) -> bool:
    db_inv = db.query(models.Investment).filter(models.Investment.id == inv_id).first()
    if not db_inv:
        return False
    db.delete(db_inv)
    db.commit()
    return True


def create_debt(db: Session, user_id: int, debt: schemas.DebtCreate) -> models.Debt:
    db_debt = models.Debt(user_id=user_id, **debt.model_dump())
    db.add(db_debt)
    db.commit()
    db.refresh(db_debt)
    return db_debt


def get_debts(db: Session, user_id: int) -> list[models.Debt]:
    return db.query(models.Debt).filter(models.Debt.user_id == user_id).all()


def update_debt(db: Session, debt_id: int, updates: schemas.DebtUpdate) -> models.Debt | None:
    db_debt = db.query(models.Debt).filter(models.Debt.id == debt_id).first()
    if not db_debt:
        return None
    for key, val in updates.model_dump(exclude_unset=True).items():
        setattr(db_debt, key, val)
    db.commit()
    db.refresh(db_debt)
    return db_debt


def delete_debt(db: Session, debt_id: int) -> bool:
    db_debt = db.query(models.Debt).filter(models.Debt.id == debt_id).first()
    if not db_debt:
        return False
    db.delete(db_debt)
    db.commit()
    return True


# ─── NOTIFICATIONS ───────────────────────────────────────────

def create_notification(db: Session, user_id: int, title: str, message: str, notif_type: str = "info") -> models.Notification:
    # Deduplicate recent notifications with same title today
    today_start = datetime.combine(date.today(), datetime.min.time())
    recent = db.query(models.Notification).filter(
        models.Notification.user_id == user_id,
        models.Notification.title == title,
        models.Notification.created_at >= today_start
    ).first()
    if recent:
        return recent

    notif = models.Notification(
        user_id=user_id,
        title=title,
        message=message,
        notif_type=notif_type,
        created_at=datetime.utcnow()
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def get_notifications(db: Session, user_id: int, limit: int = 20) -> list[models.Notification]:
    return db.query(models.Notification).filter(
        models.Notification.user_id == user_id
    ).order_by(models.Notification.created_at.desc()).limit(limit).all()


def mark_notifications_read(db: Session, user_id: int):
    db.query(models.Notification).filter(models.Notification.user_id == user_id).update({"is_read": True})
    db.commit()


# ─── GOAL & INCOME CRUD (COMPATIBILITY) ──────────────────────

def create_income_source(db: Session, user_id: int, income: schemas.IncomeSourceCreate) -> models.IncomeSource:
    db_income = models.IncomeSource(user_id=user_id, **income.model_dump())
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income


def get_income_sources(db: Session, user_id: int) -> list[models.IncomeSource]:
    return db.query(models.IncomeSource).filter(models.IncomeSource.user_id == user_id).all()


def get_income_source(db: Session, income_id: int) -> models.IncomeSource | None:
    return db.query(models.IncomeSource).filter(models.IncomeSource.id == income_id).first()


def update_income_source(db: Session, income_id: int, updates: schemas.IncomeSourceUpdate) -> models.IncomeSource | None:
    db_income = get_income_source(db, income_id)
    if not db_income:
        return None
    for key, val in updates.model_dump(exclude_unset=True).items():
        setattr(db_income, key, val)
    db.commit()
    db.refresh(db_income)
    return db_income


def delete_income_source(db: Session, income_id: int) -> bool:
    db_income = get_income_source(db, income_id)
    if not db_income:
        return False
    db.delete(db_income)
    db.commit()
    return True


def create_goal(db: Session, user_id: int, goal: schemas.GoalCreate) -> models.Goal:
    db_goal = models.Goal(user_id=user_id, **goal.model_dump())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def get_goals(db: Session, user_id: int) -> list[models.Goal]:
    return db.query(models.Goal).filter(models.Goal.user_id == user_id).all()


def get_goal(db: Session, goal_id: int) -> models.Goal | None:
    return db.query(models.Goal).filter(models.Goal.id == goal_id).first()


def update_goal(db: Session, goal_id: int, updates: schemas.GoalUpdate) -> models.Goal | None:
    db_goal = get_goal(db, goal_id)
    if not db_goal:
        return None
    for key, val in updates.model_dump(exclude_unset=True).items():
        setattr(db_goal, key, val)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def delete_goal(db: Session, goal_id: int) -> bool:
    db_goal = get_goal(db, goal_id)
    if not db_goal:
        return False
    db.delete(db_goal)
    db.commit()
    return True


# ─── 2X3 PILL DASHBOARD & INSIGHTS GENERATION ────────────────

def get_dashboard_stats(db: Session, user_id: int) -> schemas.DashboardStats:
    # 1. Process any pending subscriptions and reminders first
    process_due_subscriptions_and_recurring(db, user_id)

    today = date.today()
    this_month_start = today.replace(day=1)
    prev_month_start = add_months_to_date(this_month_start, -1)
    prev_month_end = this_month_start - timedelta(days=1)

    # 2. Net worth and accounts
    nw_summary = get_net_worth_summary(db, user_id)

    # 3. Monthly Income & Expense
    this_month_txs = db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.date >= this_month_start,
        models.Transaction.date <= today
    ).all()

    total_income = sum(t.amount for t in this_month_txs if t.transaction_type == "income")
    # If user has monthly_net_income set and no explicit income transactions yet, use that as reference
    user = get_user(db, user_id)
    if total_income == 0 and user and user.monthly_net_income > 0:
        total_income = user.monthly_net_income

    total_expense = sum(t.amount for t in this_month_txs if t.transaction_type == "expense")
    savings_rate = ((total_income - total_expense) / total_income * 100) if total_income > 0 else 0.0

    # 4. Categories & Spend stats (2x3 pill calculation)
    categories = get_categories(db, user_id)
    cat_map = {c.name.lower(): c for c in categories}

    # Group this month expenses by category
    cat_spend_map = {}
    subtag_spend_map = {}
    for t in this_month_txs:
        if t.transaction_type == "expense":
            c_name = t.category.capitalize() if t.category else "General"
            cat_spend_map[c_name] = cat_spend_map.get(c_name, 0.0) + t.amount

            # Sub-tags / subcategory grouping
            sub_tag = t.tags or t.subcategory or "General"
            if c_name not in subtag_spend_map:
                subtag_spend_map[c_name] = {}
            for st in sub_tag.split(","):
                st_clean = st.strip() or "General"
                subtag_spend_map[c_name][st_clean] = subtag_spend_map[c_name].get(st_clean, 0.0) + t.amount

    # Group previous month expenses for trend computation
    prev_month_txs = db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.date >= prev_month_start,
        models.Transaction.date <= prev_month_end,
        models.Transaction.transaction_type == "expense"
    ).all()
    prev_cat_spend_map = {}
    for t in prev_month_txs:
        c_name = t.category.capitalize() if t.category else "General"
        prev_cat_spend_map[c_name] = prev_cat_spend_map.get(c_name, 0.0) + t.amount

    # Fetch active budgets for this month
    month_key = today.strftime("%Y-%m")
    budgets_list = get_budgets(db, user_id, month_key)
    budget_map = {b.category.lower(): b for b in budgets_list}

    all_cat_stats = []
    # Include all default system categories + any categories with spend
    unique_cat_names = set(c.name for c in categories).union(set(cat_spend_map.keys()))

    for c_name in unique_cat_names:
        c_obj = cat_map.get(c_name.lower())
        spend_now = cat_spend_map.get(c_name, 0.0)
        spend_prev = prev_cat_spend_map.get(c_name, 0.0)
        
        pct_of_total = (spend_now / total_expense * 100) if total_expense > 0 else 0.0
        
        if spend_prev > 0:
            trend_pct = ((spend_now - spend_prev) / spend_prev) * 100
        else:
            trend_pct = 100.0 if spend_now > 0 else 0.0

        # Sub-tags breakdown list
        st_dict = subtag_spend_map.get(c_name, {})
        subtags_list = []
        for st_k, st_v in sorted(st_dict.items(), key=lambda x: x[1], reverse=True):
            st_pct = (st_v / spend_now * 100) if spend_now > 0 else 0.0
            subtags_list.append({"name": st_k, "amount": st_v, "pct": round(st_pct, 1)})

        b_obj = budget_map.get(c_name.lower())

        all_cat_stats.append(schemas.CategoryPillStat(
            category_id=c_obj.id if c_obj else None,
            name=c_name,
            icon=c_obj.icon if c_obj else "Tag",
            color=c_obj.color if c_obj else "#6366f1",
            spend_this_month=spend_now,
            percentage_of_total=round(pct_of_total, 1),
            prev_month_spend=spend_prev,
            trend_percentage=round(trend_pct, 1),
            subtags_breakdown=subtags_list,
            budget_limit=b_obj.monthly_limit if b_obj else None,
            budget_used_pct=round(b_obj.percentage_used, 1) if b_obj else None
        ))

    # Sort categories: highest spend first, with non-zero spend prioritized
    sorted_cat_stats = sorted(all_cat_stats, key=lambda x: (x.spend_this_month, x.prev_month_spend), reverse=True)
    # Pick top 6 for the 2x3 pill grid
    pill_categories = sorted_cat_stats[:6] if len(sorted_cat_stats) >= 6 else sorted_cat_stats

    # 5. Month-over-month trend comparison (last 6 months)
    monthly_trends = []
    for m in range(5, -1, -1):
        m_date = add_months_to_date(today.replace(day=1), -m)
        m_end = add_months_to_date(m_date, 1) - timedelta(days=1)
        m_txs = db.query(models.Transaction).filter(
            models.Transaction.user_id == user_id,
            models.Transaction.date >= m_date,
            models.Transaction.date <= m_end
        ).all()
        m_inc = sum(t.amount for t in m_txs if t.transaction_type == "income")
        if m_inc == 0 and user and user.monthly_net_income > 0:
            m_inc = user.monthly_net_income
        m_exp = sum(t.amount for t in m_txs if t.transaction_type == "expense")
        m_sav = max(0.0, m_inc - m_exp)

        monthly_trends.append(schemas.MonthTrendStat(
            month_name=m_date.strftime("%b"),
            month_key=m_date.strftime("%Y-%m"),
            income=m_inc,
            expense=m_exp,
            savings=m_sav
        ))

    # 6. Anomaly Detection
    # Flag transactions that are > 3x the average for their category
    anomalies = []
    for tx in this_month_txs:
        if tx.transaction_type == "expense" and tx.amount > 1000:
            # check category average
            avg_amount = db.query(func.avg(models.Transaction.amount)).filter(
                models.Transaction.user_id == user_id,
                models.Transaction.category.ilike(tx.category),
                models.Transaction.transaction_type == "expense"
            ).scalar() or tx.amount
            if avg_amount > 0 and tx.amount >= 2.5 * avg_amount:
                anomalies.append(schemas.AnomalyItem(
                    id=tx.id,
                    title=tx.note or tx.subcategory or f"{tx.category} Expense",
                    amount=tx.amount,
                    category=tx.category,
                    date=tx.date,
                    reason=f"{tx.amount / avg_amount:.1f}x higher than category average"
                ))

    # 7. Upcoming Reminders (Subscriptions and Recurring due in next 7 days)
    upcoming_reminders = []
    due_limit = today + timedelta(days=7)
    
    subs = db.query(models.Subscription).filter(
        models.Subscription.user_id == user_id,
        models.Subscription.status == "active",
        models.Subscription.next_due_date >= today,
        models.Subscription.next_due_date <= due_limit
    ).order_by(models.Subscription.next_due_date.asc()).all()

    for s in subs:
        days = (s.next_due_date - today).days
        upcoming_reminders.append({
            "id": f"sub_{s.id}",
            "type": "Subscription",
            "name": s.name,
            "amount": s.amount,
            "category": s.category,
            "due_date": str(s.next_due_date),
            "days_left": days,
            "is_urgent": days <= 1
        })

    recs = db.query(models.RecurringTransaction).filter(
        models.RecurringTransaction.user_id == user_id,
        models.RecurringTransaction.status == "active",
        models.RecurringTransaction.next_due_date >= today,
        models.RecurringTransaction.next_due_date <= due_limit
    ).order_by(models.RecurringTransaction.next_due_date.asc()).all()

    for r in recs:
        days = (r.next_due_date - today).days
        upcoming_reminders.append({
            "id": f"rec_{r.id}",
            "type": "Recurring Bill",
            "name": r.name,
            "amount": r.amount,
            "category": r.category,
            "due_date": str(r.next_due_date),
            "days_left": days,
            "is_urgent": days <= 1
        })

    return schemas.DashboardStats(
        net_worth=nw_summary.total_net_worth,
        total_assets=nw_summary.total_assets,
        total_liabilities=nw_summary.total_liabilities,
        total_income_this_month=total_income,
        total_expense_this_month=total_expense,
        savings_rate=round(savings_rate, 1),
        category_pills=pill_categories,
        all_category_stats=sorted_cat_stats,
        monthly_trends=monthly_trends,
        anomalies=anomalies[:5],
        upcoming_reminders=upcoming_reminders,
        budgets=budgets_list,
        accounts=nw_summary.accounts
    )


# ─── CHAT CRUD ───────────────────────────────────────────────

def create_chat_session(db: Session, user_id: int, session: schemas.ChatSessionCreate) -> models.ChatSession:
    db_session = models.ChatSession(user_id=user_id, **session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


def get_chat_sessions(db: Session, user_id: int, limit: int = 10) -> list[models.ChatSession]:
    return db.query(models.ChatSession).filter(models.ChatSession.user_id == user_id).order_by(models.ChatSession.id.desc()).limit(limit).all()


def update_chat_session_title(db: Session, session_id: int, title: str) -> models.ChatSession | None:
    db_session = db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()
    if not db_session:
        return None
    db_session.title = title
    db.commit()
    db.refresh(db_session)
    return db_session


def create_chat_message(db: Session, user_id: int, message: schemas.ChatMessageCreate) -> models.ChatMessage:
    db_message = models.ChatMessage(user_id=user_id, **message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def get_chat_messages(db: Session, session_id: int, limit: int = 50) -> list[models.ChatMessage]:
    return db.query(models.ChatMessage).filter(models.ChatMessage.session_id == session_id).order_by(models.ChatMessage.id.desc()).limit(limit).all()
