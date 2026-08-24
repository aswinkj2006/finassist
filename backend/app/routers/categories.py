from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/users/{user_id}/categories", tags=["categories"])


@router.get("/", response_model=list[schemas.CategoryRead])
def read_categories(user_id: int, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_categories(db, user_id)


@router.post("/", response_model=schemas.CategoryRead, status_code=201)
def create_category(user_id: int, category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_category(db, user_id, category)


@router.put("/{category_id}", response_model=schemas.CategoryRead)
def update_category(user_id: int, category_id: int, updates: schemas.CategoryUpdate, db: Session = Depends(get_db)):
    db_cat = crud.update_category(db, category_id, updates)
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_cat


@router.delete("/{category_id}", status_code=204)
def delete_category(user_id: int, category_id: int, db: Session = Depends(get_db)):
    if not crud.delete_category(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")


@router.post("/{category_id}/tags", response_model=schemas.TagRead, status_code=201)
def add_tag_to_category(user_id: int, category_id: int, tag: schemas.TagCreate, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_tag(db, user_id, category_id, tag)
