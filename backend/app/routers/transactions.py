import io
import csv
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/users/{user_id}/transactions", tags=["transactions"])


@router.post("/", response_model=schemas.TransactionRead, status_code=201)
def create_transaction(user_id: int, tx: schemas.TransactionCreate, db: Session = Depends(get_db)):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_transaction(db, user_id, tx)


@router.get("/", response_model=list[schemas.TransactionRead])
def read_transactions(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    category: str = None,
    account_id: int = None,
    tag: str = None,
    transaction_type: str = None,
    min_amount: float = None,
    max_amount: float = None,
    start_date: date = None,
    end_date: date = None,
    days_ago: int = None,
    db: Session = Depends(get_db)
):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_transactions(
        db, user_id,
        skip=skip, limit=limit,
        search=search, category=category, account_id=account_id,
        tag=tag, transaction_type=transaction_type,
        min_amount=min_amount, max_amount=max_amount,
        start_date=start_date, end_date=end_date,
        days_ago=days_ago
    )


@router.get("/export/csv")
def export_transactions_csv(
    user_id: int,
    category: str = None,
    start_date: date = None,
    end_date: date = None,
    db: Session = Depends(get_db)
):
    if not crud.get_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    
    txs = crud.get_transactions(
        db, user_id, skip=0, limit=5000,
        category=category, start_date=start_date, end_date=end_date
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Date", "Type", "Category", "Sub-tags", "Amount", "Currency", "Note", "Source"])
    for t in txs:
        writer.writerow([
            t.id, str(t.date), t.transaction_type, t.category,
            t.tags or t.subcategory, t.amount, t.currency, t.note, t.source
        ])
    
    csv_content = output.getvalue()
    filename = f"finassist_transactions_{date.today().strftime('%Y%m%d')}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/{tx_id}", response_model=schemas.TransactionRead)
def read_transaction(user_id: int, tx_id: int, db: Session = Depends(get_db)):
    db_tx = crud.get_transaction(db, tx_id)
    if not db_tx or db_tx.user_id != user_id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_tx


@router.put("/{tx_id}", response_model=schemas.TransactionRead)
def update_transaction(user_id: int, tx_id: int, updates: schemas.TransactionUpdate, db: Session = Depends(get_db)):
    db_tx = crud.get_transaction(db, tx_id)
    if not db_tx or db_tx.user_id != user_id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return crud.update_transaction(db, tx_id, updates)


@router.delete("/{tx_id}", status_code=204)
def delete_transaction(user_id: int, tx_id: int, db: Session = Depends(get_db)):
    db_tx = crud.get_transaction(db, tx_id)
    if not db_tx or db_tx.user_id != user_id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    crud.delete_transaction(db, tx_id)
