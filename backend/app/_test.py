# Copyright (C) 2024 Alexandre Amat
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from typing import Generator

import pytest
from sqlalchemy import create_engine, event
from sqlmodel import Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import app

from app.common.models import Base
from app.features.institution.models import Institution
from app.features.user.models import User
from app.features.userinstitutionlink.models import UserInstitutionLink
from app.features.account.models import Account
from app.features.transaction.models import Transaction

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
