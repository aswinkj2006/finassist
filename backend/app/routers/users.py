from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=schemas.UserRead, status_code=201)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)


@router.get("/", response_model=list[schemas.UserRead])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=schemas.UserRead)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.put("/{user_id}", response_model=schemas.UserRead)
def update_user(user_id: int, updates: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = crud.update_user(db, user_id, updates)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    if not crud.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")


@router.get("/{user_id}/dashboard-stats", response_model=schemas.DashboardStats)
def read_dashboard_stats(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_dashboard_stats(db, user_id)


# Legacy endpoint support
@router.get("/{user_id}/scores")
def read_user_scores(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    stats = crud.get_dashboard_stats(db, user_id)
    return {
        "net_income": stats.total_income_this_month,
        "spending_score": {
            "needs": {"spent_amount": 0, "target_percentage": 50, "actual_percentage": 0, "status_flag": "on track"},
            "wants": {"spent_amount": 0, "target_percentage": 30, "actual_percentage": 0, "status_flag": "on track"},
            "savings_investing": {"spent_amount": 0, "target_percentage": 20, "actual_percentage": 0, "status_flag": "on track"}
        },
        "savings_score": {
            "saved_amount": stats.total_income_this_month - stats.total_expense_this_month,
            "actual_percentage": stats.savings_rate,
            "band": "good"
        }
    }
