from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/users/{user_id}/subscriptions", tags=["subscriptions"])


@router.get("/", response_model=list[schemas.SubscriptionRead])
def read_subscriptions(user_id: int, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    crud.process_due_subscriptions_and_recurring(db, user_id)
    return crud.get_subscriptions(db, user_id)


@router.post("/", response_model=schemas.SubscriptionRead, status_code=201)
def create_subscription(user_id: int, sub: schemas.SubscriptionCreate, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_subscription(db, user_id, sub)


@router.put("/{sub_id}", response_model=schemas.SubscriptionRead)
def update_subscription(user_id: int, sub_id: int, updates: schemas.SubscriptionUpdate, db: Session = Depends(get_db)):
    db_sub = crud.update_subscription(db, sub_id, updates)
    if not db_sub or db_sub.user_id != user_id:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return db_sub


@router.delete("/{sub_id}", status_code=204)
def delete_subscription(user_id: int, sub_id: int, db: Session = Depends(get_db)):
    if not crud.delete_subscription(db, sub_id):
        raise HTTPException(status_code=404, detail="Subscription not found")


@router.post("/process-due")
def trigger_process_due(user_id: int, db: Session = Depends(get_db)):
    crud.process_due_subscriptions_and_recurring(db, user_id)
    return {"status": "processed"}
