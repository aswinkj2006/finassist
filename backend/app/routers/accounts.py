from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/users/{user_id}/accounts", tags=["accounts"])


@router.get("/", response_model=list[schemas.AccountRead])
def read_accounts(user_id: int, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_accounts(db, user_id)


@router.post("/", response_model=schemas.AccountRead, status_code=201)
def create_account(user_id: int, account: schemas.AccountCreate, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_account(db, user_id, account)


@router.get("/net-worth", response_model=schemas.NetWorthSummary)
def read_net_worth(user_id: int, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_net_worth_summary(db, user_id)


@router.get("/{account_id}", response_model=schemas.AccountRead)
def read_account(user_id: int, account_id: int, db: Session = Depends(get_db)):
    db_acc = crud.get_account(db, account_id)
    if not db_acc or db_acc.user_id != user_id:
        raise HTTPException(status_code=404, detail="Account not found")
    return db_acc


@router.put("/{account_id}", response_model=schemas.AccountRead)
def update_account(user_id: int, account_id: int, updates: schemas.AccountUpdate, db: Session = Depends(get_db)):
    db_acc = crud.get_account(db, account_id)
    if not db_acc or db_acc.user_id != user_id:
        raise HTTPException(status_code=404, detail="Account not found")
    return crud.update_account(db, account_id, updates)


@router.delete("/{account_id}", status_code=204)
def delete_account(user_id: int, account_id: int, db: Session = Depends(get_db)):
    db_acc = crud.get_account(db, account_id)
    if not db_acc or db_acc.user_id != user_id:
        raise HTTPException(status_code=404, detail="Account not found")
    crud.delete_account(db, account_id)
