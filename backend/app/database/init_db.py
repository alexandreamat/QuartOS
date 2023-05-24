from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from app.core.config import settings
from app.features.user.crud import CRUDUser
from app.features.user.schemas import UserWrite

from .base import Base
from .session import engine


# make sure all SQL Alchemy models are imported (app.database.base) before initializing DB
# otherwise, SQL Alchemy might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-postgresql/issues/28


def init_db(db: Session) -> None:
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
