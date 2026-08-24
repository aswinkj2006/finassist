from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/users/{user_id}/notifications", tags=["notifications"])


@router.get("/", response_model=list[schemas.NotificationRead])
def read_notifications(user_id: int, limit: int = 20, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_notifications(db, user_id, limit)


@router.post("/mark-read")
def mark_all_read(user_id: int, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    crud.mark_notifications_read(db, user_id)
    return {"status": "success"}
