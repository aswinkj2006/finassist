from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/users/{user_id}/incomes", tags=["incomes"])


@router.post("/", response_model=schemas.IncomeSourceRead, status_code=201)
def create_income(user_id: int, income: schemas.IncomeSourceCreate, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_income_source(db, user_id, income)


@router.get("/", response_model=list[schemas.IncomeSourceRead])
def read_incomes(user_id: int, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_income_sources(db, user_id)


@router.get("/{income_id}", response_model=schemas.IncomeSourceRead)
def read_income(user_id: int, income_id: int, db: Session = Depends(get_db)):
    db_income = crud.get_income_source(db, income_id)
    if not db_income or db_income.user_id != user_id:
        raise HTTPException(status_code=404, detail="Income source not found")
    return db_income


@router.put("/{income_id}", response_model=schemas.IncomeSourceRead)
def update_income(user_id: int, income_id: int, updates: schemas.IncomeSourceUpdate, db: Session = Depends(get_db)):
    db_income = crud.get_income_source(db, income_id)
    if not db_income or db_income.user_id != user_id:
        raise HTTPException(status_code=404, detail="Income source not found")
    return crud.update_income_source(db, income_id, updates)


@router.delete("/{income_id}", status_code=204)
def delete_income(user_id: int, income_id: int, db: Session = Depends(get_db)):
    db_income = crud.get_income_source(db, income_id)
    if not db_income or db_income.user_id != user_id:
        raise HTTPException(status_code=404, detail="Income source not found")
    crud.delete_income_source(db, income_id)
