# 1. Import base model
from sqlmodel import Session
from sqlalchemy.exc import NoResultFound

from app.settings import settings
from app.features.user.crud import CRUDUser
from app.features.user.models import UserApiIn

# 1. Import base model
from app.common.models import IdentifiableBase

# 2. Import inheritors of the base model
from app.features.user.models import User
from app.features.institution.models import Institution
from app.features.userinstitutionlink.models import UserInstitutionLink
from app.features.account.models import Account
from app.features.movement.models import Movement
from app.features.transaction.models import Transaction

from .deps import engine


def init_db(db: Session) -> None:
    # 3. Retrieve inheritors from base through metadata
    IdentifiableBase.metadata.create_all(engine)

    try:
        CRUDUser.read_by_email(db, email=settings.FIRST_SUPERUSER)
    except NoResultFound:
        user_in = UserApiIn(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            full_name=settings.FIRST_SUPERUSER_FULL_NAME,
            is_superuser=True,
        )
        CRUDUser.create(db, new_schema_obj=user_in)
