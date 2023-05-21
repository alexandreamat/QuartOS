from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from app import crud, schemas
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine


# make sure all SQL Alchemy models are imported (app.db.base) before initializing DB
# otherwise, SQL Alchemy might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-postgresql/issues/28


def init_db(db: Session) -> None:
    Base.metadata.create_all(bind=engine)

    try:
        crud.user.read_by_email(db, email=settings.FIRST_SUPERUSER)
    except NoResultFound:
        user_in = schemas.UserWrite(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        crud.user.create(db, new_schema_obj=user_in)
