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
from fastapi.testclient import TestClient
import pytest
from sqlmodel import Session
from app.features.user.deps import get_current_user
from app.features.user.models import UserApiOut
from app.main import app

from app._test import db, client

from .models import UserApiIn
from .crud import CRUDUser


@pytest.fixture
def superuser_write() -> UserApiIn:
    return UserApiIn(
        email="admin@quartos.com",
        full_name="Admin",
        is_superuser=True,
        password="supersupersecret",
    )


@pytest.fixture
def user_write() -> UserApiIn:
    return UserApiIn(
        email="john@quartos.com",
        full_name="John Smith",
        is_superuser=False,
        password="supersecret",
    )


@pytest.fixture
def users_db(db: Session, user_write: UserApiIn, superuser_write: UserApiIn) -> Session:
    CRUDUser.create(db, user_write)
    CRUDUser.create(db, superuser_write)
    return db


@pytest.fixture
def superuser_read(users_db: Session) -> UserApiOut:
    return CRUDUser.read_by_email(users_db, "admin@quartos.com")


@pytest.fixture
def user_read(users_db: Session) -> UserApiOut:
    return CRUDUser.read_by_email(users_db, "john@quartos.com")


@pytest.fixture
def superuser_client(
    db: Session, client: TestClient, superuser_read: UserApiOut
) -> Generator[TestClient, None, None]:
    app.dependency_overrides[get_current_user] = lambda: superuser_read
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def user_client(
    db: Session, client: TestClient, user_read: UserApiOut
) -> Generator[TestClient, None, None]:
    app.dependency_overrides[get_current_user] = lambda: user_read
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_signup(client: TestClient, db: Session) -> None:
    user = UserApiIn(
        email="test@example.com",
        password="supersecretpassword",
        full_name="Test User",
        is_superuser=False,
    )
    response = client.post("api/users/signup", json=user.dict())
    assert response.status_code == 200
    data = response.json()
    assert data["id"]
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert data["is_superuser"] == False


def test_read_me(user_client: TestClient, users_db: Session) -> None:
    response = user_client.get("api/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["id"]
    assert data["email"] == "john@quartos.com"
    assert data["full_name"] == "John Smith"
    assert data["is_superuser"] == False


def test_superuser_read(superuser_client: TestClient, users_db: Session) -> None:
    response = superuser_client.get("/api/users/1")
    assert response.status_code == 200
    response = superuser_client.get("/api/users/2")
    assert response.status_code == 200


def test_user_read(user_client: TestClient, users_db: Session) -> None:
    response = user_client.get("/api/users/2")
    assert response.status_code == 403
    response = user_client.get("/api/users/1")
    assert response.status_code == 403
