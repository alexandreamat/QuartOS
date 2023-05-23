from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from app import schemas
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

from app.crud.user import CRUDUser


# make sure all SQL Alchemy models are imported (app.db.base) before initializing DB
# otherwise, SQL Alchemy might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-postgresql/issues/28


def init_db(db: Session) -> None:
    Base.metadata.create_all(bind=engine)

    try:
        CRUDUser.read_by_email(db, email=settings.FIRST_SUPERUSER)
    except NoResultFound:
        user_in = schemas.UserWrite(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            full_name=settings.FIRST_SUPERUSER_FULL_NAME,
            is_superuser=True,
        )
        CRUDUser.create(db, new_schema_obj=user_in)
