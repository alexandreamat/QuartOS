import tempfile
import csv
from typing import Annotated
from decimal import Decimal
from datetime import datetime

from fastapi import APIRouter, HTTPException, status, UploadFile, File
from sqlalchemy.exc import NoResultFound

from app.features.user.deps import CurrentUser
from app.database.deps import DBSession


from .crud import CRUDAccount
from .models import AccountApiOut, AccountApiIn

from app.features.userinstitutionlink.crud import CRUDUserInstitutionLink

from app.features import transaction

router = APIRouter()


@router.post("/")
def create(
    db: DBSession,
    current_user: CurrentUser,
    account: AccountApiIn,
) -> AccountApiOut:
    try:
        user = CRUDUserInstitutionLink.read_user(db, account.user_institution_link_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if CRUDUserInstitutionLink.is_synced(db, account.user_institution_link_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDAccount.create(db, account)


@router.get("/{id}")
def read(db: DBSession, current_user: CurrentUser, id: int) -> AccountApiOut:
    try:
        account = CRUDAccount.read(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if CRUDAccount.read_user(db, account.id).id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return account


def deserialise_amount(row: list[str]) -> Decimal:
    return Decimal(row[8].replace(",", "") or 0) - Decimal(row[9].replace(",", "") or 0)


def deserialise_datetime(row: list[str]) -> datetime:
    return datetime.strptime(row[0], "%Y-%m-%d")


def deserialise_name(row: list[str]) -> str:
    return f"{row[1]}: {row[2]}"


def deserialise_currency_code(row: list[str]) -> str:
    return {"人民币": "CNY"}[row[10]]


def deserialise_payment_channel(row: list[str]) -> str:
    return {
        "消费": "in store",
        "退货": "in store",
        "支付宝提现": "online",
        "金融付款": "online",
        "退款": "in store",
    }.get(row[1], "other")


def deserialise_code(row: list[str]) -> str:
    return {
        "消费": "purchase",
        "退货": "adjustment",
        "利息": "interest",
        "转账": "transfer",
        "跨境费": "bank charge",
        "费": "bank charge",
        "ATM取款": "atm",
        "支付宝提现": "cash",
        "金融付款": "bill payment",
        "异地费": "bank charge",
        "反费": "adjustment",
        "取消费": "bank charge",
        "账务调整": "adjustment",
        "退款": "adjustment",
    }.get(row[1], "null")


import re


def sanitise_row(row: list[str]) -> None:
    for i in range(len(row)):
        row[i] = re.sub(r"[\s\t]+", " ", row[i]).strip()


@router.post("/{id}/transactions-sheet")
def upload_transactions_sheet(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    file: Annotated[UploadFile, File(...)],
) -> list[transaction.models.TransactionApiIn]:
    try:
        user = CRUDAccount.read_user(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if CRUDAccount.is_synced(db, id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    with tempfile.NamedTemporaryFile() as temp_file:
        try:
            temp_file.write(file.file.read())
            temp_file.flush()
            with open(temp_file.name, "r") as f:
                csv_reader = csv.reader(f)
                for _ in range(7):
                    next(csv_reader)
                transactions = []
                for row in csv_reader:
                    if len(row) != 14:
                        break
                    sanitise_row(row)
                    tx = transaction.models.TransactionApiIn(
                        account_id=id,
                        amount=deserialise_amount(row),
                        datetime=deserialise_datetime(row),
                        name=deserialise_name(row),
                        currency_code=deserialise_currency_code(row),
                        payment_channel=deserialise_payment_channel(row),
                        code=deserialise_code(row),
                    )
                    transactions.append(tx)
                return transactions
        except Exception as e:
            exc_message = getattr(e, "message", str(e))
            error_message = f"{type(e).__name__}: {exc_message}"
            raise HTTPException(status.HTTP_400_BAD_REQUEST, error_message)


@router.get("/")
def read_many(db: DBSession, current_user: CurrentUser) -> list[AccountApiOut]:
    return CRUDAccount.read_many_by_user(db, current_user.id)


@router.put("/{id}")
def update(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
    account: AccountApiIn,
) -> AccountApiOut:
    try:
        user = CRUDAccount.read_user(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if CRUDAccount.is_synced(db, id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    try:
        user = CRUDUserInstitutionLink.read_user(db, account.user_institution_link_id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDAccount.update(db, id, account)


@router.delete("/{id}")
def delete(
    db: DBSession,
    current_user: CurrentUser,
    id: int,
) -> None:
    try:
        user = CRUDAccount.read_user(db, id)
    except NoResultFound:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    if user.id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    if CRUDAccount.is_synced(db, id):
        raise HTTPException(status.HTTP_403_FORBIDDEN)
    return CRUDAccount.delete(db, id)
