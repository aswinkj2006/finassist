from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/users/{user_id}/goals", tags=["goals"])


@router.post("/", response_model=schemas.GoalRead, status_code=201)
def create_goal(user_id: int, goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_goal(db, user_id, goal)


@router.get("/", response_model=list[schemas.GoalRead])
def read_goals(user_id: int, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_goals(db, user_id)


@router.get("/{goal_id}", response_model=schemas.GoalRead)
def read_goal(user_id: int, goal_id: int, db: Session = Depends(get_db)):
    db_goal = crud.get_goal(db, goal_id)
    if not db_goal or db_goal.user_id != user_id:
        raise HTTPException(status_code=404, detail="Goal not found")
    return db_goal


@router.put("/{goal_id}", response_model=schemas.GoalRead)
def update_goal(user_id: int, goal_id: int, updates: schemas.GoalUpdate, db: Session = Depends(get_db)):
    db_goal = crud.get_goal(db, goal_id)
    if not db_goal or db_goal.user_id != user_id:
        raise HTTPException(status_code=404, detail="Goal not found")
    return crud.update_goal(db, goal_id, updates)


@router.delete("/{goal_id}", status_code=204)
def delete_goal(user_id: int, goal_id: int, db: Session = Depends(get_db)):
    db_goal = crud.get_goal(db, goal_id)
    if not db_goal or db_goal.user_id != user_id:
        raise HTTPException(status_code=404, detail="Goal not found")
    crud.delete_goal(db, goal_id)
