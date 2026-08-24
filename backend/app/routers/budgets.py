from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/users/{user_id}/budgets", tags=["budgets"])


@router.get("/", response_model=list[schemas.BudgetRead])
def read_budgets(user_id: int, month_year: str = None, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_budgets(db, user_id, month_year)


@router.post("/", response_model=schemas.BudgetRead, status_code=201)
def create_or_update_budget(user_id: int, budget: schemas.BudgetCreate, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    b = crud.create_budget(db, user_id, budget)
    # Return formatted BudgetRead
    all_b = crud.get_budgets(db, user_id, budget.month_year)
    for res in all_b:
        if res.category.lower() == budget.category.lower():
            return res
    return schemas.BudgetRead(
        id=b.id, user_id=b.user_id, category=b.category, category_id=b.category_id,
        monthly_limit=b.monthly_limit, month_year=b.month_year,
        alert_threshold=b.alert_threshold, envelope_allocated=b.envelope_allocated
    )


@router.delete("/{budget_id}", status_code=204)
def delete_budget(user_id: int, budget_id: int, db: Session = Depends(get_db)):
    from .. import models
    b = db.query(models.Budget).filter(models.Budget.id == budget_id, models.Budget.user_id == user_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(b)
    db.commit()
