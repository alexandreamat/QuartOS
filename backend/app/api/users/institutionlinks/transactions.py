from typing import Iterable
from datetime import date

from fastapi import APIRouter

from app.database.deps import DBSession

from app.features.user import CurrentSuperuser
from app.features.transaction import (
    TransactionPlaidIn,
    TransactionPlaidOut,
    reset_transaction_to_metadata,
)

from app.features.userinstitutionlink import (
    CRUDSyncableUserInstitutionLink,
    fetch_transactions,
)


router = APIRouter()


@router.get("/plaid/{start_date}/{end_date}")
def read_transactions_plaid(
    db: DBSession,
    current_user: CurrentSuperuser,
    institution_link_id: int,
    start_date: date,
    end_date: date,
) -> Iterable[TransactionPlaidIn]:
    user_institution_link = CRUDSyncableUserInstitutionLink.read(
        db, institution_link_id
    )
    return fetch_transactions(db, user_institution_link, start_date, end_date)


@router.put("/plaid/reset")
def reset_transactions_plaid(
    db: DBSession, current_user: CurrentSuperuser, institution_link_id: int
) -> Iterable[TransactionPlaidOut]:
    for t in CRUDSyncableUserInstitutionLink.read_transactions(db, institution_link_id):
        yield reset_transaction_to_metadata(db, t.id)
