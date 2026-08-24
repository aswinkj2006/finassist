from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/users/{user_id}/investments", tags=["investments"])


@router.get("/", response_model=list[schemas.InvestmentRead])
def read_investments(user_id: int, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_investments(db, user_id)


@router.post("/", response_model=schemas.InvestmentRead, status_code=201)
def create_investment(user_id: int, inv: schemas.InvestmentCreate, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_investment(db, user_id, inv)


@router.put("/{inv_id}", response_model=schemas.InvestmentRead)
def update_investment(user_id: int, inv_id: int, updates: schemas.InvestmentUpdate, db: Session = Depends(get_db)):
    db_inv = crud.update_investment(db, inv_id, updates)
    if not db_inv or db_inv.user_id != user_id:
        raise HTTPException(status_code=404, detail="Investment not found")
    return db_inv


@router.delete("/{inv_id}", status_code=204)
def delete_investment(user_id: int, inv_id: int, db: Session = Depends(get_db)):
    if not crud.delete_investment(db, inv_id):
        raise HTTPException(status_code=404, detail="Investment not found")
