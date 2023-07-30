from fastapi import APIRouter
from sqlalchemy.exc import NoResultFound

from app.database.deps import DBSession

from app.common.plaid import create_link_token, exchange_public_token
from app.features.user import CurrentUser
from app.features.institution import CRUDSyncableInstitution, fetch_institution
from app.features.userinstitutionlink import (
    CRUDSyncableUserInstitutionLink,
    fetch_user_institution_link,
)
from app.features.account import CRUDAccount, fetch_accounts

router = APIRouter()


@router.get("/link_token")
def get_link_token(me: CurrentUser) -> str:
    return create_link_token(me.id)


@router.post("/public_token")
def set_public_token(
    db: DBSession,
    me: CurrentUser,
    public_token: str,
    institution_plaid_id: str,
) -> None:
    # 1. Get or create institution
    try:
        institution_obj = CRUDSyncableInstitution.read_by_plaid_id(
            db, institution_plaid_id
        )
    except NoResultFound:
        institution_obj = CRUDSyncableInstitution.create(
            db, fetch_institution(institution_plaid_id)
        )
    # 2. Create user institution link
    access_token = exchange_public_token(public_token)
    user_institution_link_in = fetch_user_institution_link(
        access_token, me, institution_obj
    )
    user_institution_link_out = CRUDSyncableUserInstitutionLink.create(
        db, user_institution_link_in
    )
    # 3. Create accounts
    accounts_in = fetch_accounts(user_institution_link_out)
    for account_in in accounts_in:
        CRUDAccount.sync(db, account_in)
