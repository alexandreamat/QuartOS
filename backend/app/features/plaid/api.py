from fastapi import APIRouter

from sqlalchemy.exc import NoResultFound
from app.database.deps import DBSession
from app.features.plaid.utils import sync_transactions
from app.features.user.deps import CurrentUser


from app.features.userinstitutionlink.crud import CRUDUserInstitutionLink
from app.features.institution.crud import CRUDInstitution
from app.features.account.crud import CRUDAccount

from .client import (
    create_link_token,
    exchange_public_token,
    get_user_institution_link,
    get_institution,
    get_accounts,
)

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
        institution = CRUDInstitution.read_by_plaid_id(db, institution_plaid_id)
    except NoResultFound:
        institution = CRUDInstitution.sync(db, get_institution(institution_plaid_id))
    # 2. Create user institution link
    access_token = exchange_public_token(public_token)
    user_institution_link_in = get_user_institution_link(
        access_token, current_user, institution
    )
    user_institution_link_out = CRUDUserInstitutionLink.sync(
        db, user_institution_link_in
    )
    # 3. Create accounts
    accounts_in = get_accounts(user_institution_link_out)
    for account_in in accounts_in:
        CRUDAccount.sync(db, account_in)
    # 4. Create transactions
    sync_transactions(db, user_institution_link_out)
