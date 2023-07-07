from fastapi import APIRouter
from sqlalchemy.exc import NoResultFound

from app.database.deps import DBSession
from app.api import api_router

from app.common.plaid import (
    create_link_token,
    exchange_public_token,
)

from app.features.user.deps import CurrentUser
from app.features.institution import (  # type: ignore[attr-defined]
    CRUDSyncableInstitution,
    fetch_institution,
    INSTITUTIONS,
)
from app.features.userinstitutionlink import (  # type: ignore[attr-defined]
    CRUDSyncableUserInstitutionLink,
    fetch_user_institution_link,
    INSTITUTION_LINKS,
)
from app.features.account import CRUDAccount, fetch_accounts, ACCOUNTS  # type: ignore[attr-defined]
from app.features.transaction import TRANSACTIONS  # type: ignore[attr-defined]

PLAID = "plaid"

router = APIRouter()


@router.get("/link_token")
def get_link_token(current_user: CurrentUser) -> str:
    return create_link_token(current_user.id)


@router.post("/public_token")
def set_public_token(
    db: DBSession,
    current_user: CurrentUser,
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
        access_token, current_user, institution_obj
    )
    user_institution_link_out = CRUDSyncableUserInstitutionLink.create(
        db, user_institution_link_in
    )
    # 3. Create accounts
    accounts_in = fetch_accounts(user_institution_link_out)
    for account_in in accounts_in:
        CRUDAccount.sync(db, account_in)


api_router.include_router(
    router,
    prefix=f"/{PLAID}",
    tags=[PLAID, INSTITUTION_LINKS, INSTITUTIONS, ACCOUNTS, TRANSACTIONS],
)
