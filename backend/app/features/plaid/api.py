from fastapi import APIRouter

from sqlalchemy.exc import NoResultFound
from app.database.deps import DBSession
from app.features.user.deps import CurrentUser

from app.features.userinstitutionlink.models import UserInstitutionLinkWrite
from app.features.institution.models import InstitutionWrite
from app.features.account.models import AccountWrite
from app.features.userinstitutionlink.crud import CRUDUserInstitutionLink
from app.features.institution.crud import CRUDInstitution
from app.features.account.crud import CRUDAccount

from .client import (
    create_link_token,
    exchange_public_token,
    get_item,
    get_institution,
    get_accounts,
)

router = APIRouter()


@router.get("/link_token")
def get_link_token(current_user: CurrentUser) -> str:
    return create_link_token(current_user.id)


@router.post("/public_token")
def set_public_token(
    db: DBSession, current_user: CurrentUser, public_token: str
) -> None:
    access_token = exchange_public_token(public_token)
    item = get_item(access_token)
    institution_id: str = item.institution_id
    institution = get_institution(institution_id)
    try:
        db_institution_out = CRUDInstitution.read_by_name(db, institution.name)
    except NoResultFound:
        db_institution_in = InstitutionWrite(
            name=institution.name, country_code=institution.country_codes[0].value
        )
        db_institution_out = CRUDInstitution.create(db, db_institution_in)
    user_institution_link_in = UserInstitutionLinkWrite(
        client_id=item.item_id,
        institution_id=db_institution_out.id,
        user_id=current_user.id,
        access_token=access_token,
    )
    user_institution_link_out = CRUDUserInstitutionLink.create(
        db, user_institution_link_in
    )

    accounts = get_accounts(access_token)
    for account in accounts:
        account_in = AccountWrite(
            currency=account.balances.iso_currency_code,
            type=account.type.value,
            number=account.name,
            user_institution_link_id=user_institution_link_out.id,
            plaid_id=account.account_id,
            balance=account.balances.current,
        )
        CRUDAccount.create(db, account_in)
