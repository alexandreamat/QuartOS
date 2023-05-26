from typing import Generator

import pytest
from sqlalchemy import create_engine, event
from sqlmodel import Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import app

from app.common.models import Base
from app.features.institution.model import Institution
from app.features.user.model import User
from app.features.userinstitutionlink.model import UserInstitutionLink
from app.features.account.model import Account
from app.features.transaction.model import Transaction

from app.database.deps import get_db


@pytest.fixture
def db() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    event.listen(engine, "connect", lambda c, _: c.execute("pragma foreign_keys=ON"))
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        yield session


@pytest.fixture
def client(db: Session) -> Generator[TestClient, None, None]:
    app.dependency_overrides[get_db] = lambda: db
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()
