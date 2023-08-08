from typing import Generator, Annotated
import logging

from sqlalchemy import event
from fastapi import Depends
from sqlmodel import create_engine, Session

from app.settings import settings


connect_args = {"check_same_thread": False}
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    connect_args=connect_args,
    # echo="debug",
    # query_cache_size=0,
)

# Enforce foreign keys integrity at the database level
event.listen(engine, "connect", lambda c, _: c.execute("pragma foreign_keys=ON"))

# Avoid double echo
logging.getLogger("sqlalchemy.engine").propagate = False


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise


DBSession = Annotated[Session, Depends(get_db)]
