from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/users/{user_id}/debts", tags=["debts"])


@router.get("/", response_model=list[schemas.DebtRead])
def read_debts(user_id: int, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_debts(db, user_id)


@router.post("/", response_model=schemas.DebtRead, status_code=201)
def create_debt(user_id: int, debt: schemas.DebtCreate, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_debt(db, user_id, debt)


@router.put("/{debt_id}", response_model=schemas.DebtRead)
def update_debt(user_id: int, debt_id: int, updates: schemas.DebtUpdate, db: Session = Depends(get_db)):
    db_debt = crud.update_debt(db, debt_id, updates)
    if not db_debt or db_debt.user_id != user_id:
        raise HTTPException(status_code=404, detail="Debt not found")
    return db_debt


@router.delete("/{debt_id}", status_code=204)
def delete_debt(user_id: int, debt_id: int, db: Session = Depends(get_db)):
    if not crud.delete_debt(db, debt_id):
        raise HTTPException(status_code=404, detail="Debt not found")
