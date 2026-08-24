from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/users/{user_id}/recurring", tags=["recurring"])


@router.get("/", response_model=list[schemas.RecurringRead])
def read_recurring(user_id: int, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    crud.process_due_subscriptions_and_recurring(db, user_id)
    return crud.get_recurring_items(db, user_id)


@router.post("/", response_model=schemas.RecurringRead, status_code=201)
def create_recurring(user_id: int, item: schemas.RecurringCreate, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_recurring(db, user_id, item)


@router.put("/{rec_id}", response_model=schemas.RecurringRead)
def update_recurring(user_id: int, rec_id: int, updates: schemas.RecurringUpdate, db: Session = Depends(get_db)):
    db_rec = crud.update_recurring(db, rec_id, updates)
    if not db_rec or db_rec.user_id != user_id:
        raise HTTPException(status_code=404, detail="Recurring item not found")
    return db_rec


@router.delete("/{rec_id}", status_code=204)
def delete_recurring(user_id: int, rec_id: int, db: Session = Depends(get_db)):
    if not crud.delete_recurring(db, rec_id):
        raise HTTPException(status_code=404, detail="Recurring item not found")
