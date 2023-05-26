from typing import Generator, Annotated

from sqlmodel import create_engine, Session
from sqlalchemy import event
from fastapi import Depends

from app.core.config import settings


connect_args = {"check_same_thread": False}
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI, echo=True, connect_args=connect_args
)
event.listen(engine, "connect", lambda c, _: c.execute("pragma foreign_keys=ON"))


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


DBSession = Annotated[Session, Depends(get_db)]
