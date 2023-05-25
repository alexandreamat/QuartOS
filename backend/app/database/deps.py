from typing import Generator, Annotated

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from fastapi import Depends

from app.core.config import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, poolclass=StaticPool)
event.listen(engine, "connect", lambda c, _: c.execute("pragma foreign_keys=ON"))

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


DBSession = Annotated[Session, Depends(get_db)]
