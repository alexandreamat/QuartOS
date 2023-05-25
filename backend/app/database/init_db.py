from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from app.core.config import settings
from app.features.user.crud import CRUDUser
from app.features.user.schemas import UserWrite

# 1. Import base model
from app.common.models import Base

# 2. Import inheritors of the base model
from app.features.institution.model import Institution
from app.features.user.model import User
from app.features.userinstitutionlink.model import UserInstitutionLink
from app.features.account.model import Account
from app.features.transaction.model import Transaction

from .deps import engine


def init_db(db: Session) -> None:
    # 3. Retrieve inheritors from base through metadata
    Base.metadata.create_all(bind=engine)

    try:
        CRUDUser.read_by_email(db, email=settings.FIRST_SUPERUSER)
    except NoResultFound:
        user_in = UserWrite(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            full_name=settings.FIRST_SUPERUSER_FULL_NAME,
            is_superuser=True,
        )
        CRUDUser.create(db, new_schema_obj=user_in)
