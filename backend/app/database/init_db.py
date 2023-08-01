# 1. Import base model
from sqlmodel import Session
from sqlalchemy.exc import NoResultFound

from app.settings import settings
from app.features.user import CRUDUser, UserApiIn

# 1. Import base model
from app.common.models import Base

# 2. Import inheritors of the base model
from app.features.replacementpattern import ReplacementPattern
from app.features.transactiondeserialiser import TransactionDeserialiser
from app.features.user import User
from app.features.institution import Institution
from app.features.userinstitutionlink import UserInstitutionLink
from app.features.account import Account
from app.features.movement import Movement
from app.features.transaction import Transaction

from .deps import engine


def init_db(db: Session) -> None:
    # 3. Retrieve inheritors from base through metadata
    Base.metadata.create_all(engine)

    try:
        CRUDUser.read_by_email(db, email=settings.FIRST_SUPERUSER)
    except NoResultFound:
        user_in = UserApiIn(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            full_name=settings.FIRST_SUPERUSER_FULL_NAME,
            is_superuser=True,
        )
        CRUDUser.create(db, obj_in=user_in)
