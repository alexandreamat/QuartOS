from typing import Generator
from fastapi.testclient import TestClient
import pytest
from sqlalchemy.orm import Session
from app.features.user.deps import get_current_user
from app.features.user.schemas import UserRead
from app.main import app

from app._test import db, client

from .schemas import UserWrite
from .crud import CRUDUser


@pytest.fixture
def superuser_write() -> UserWrite:
    return UserWrite(
        email="admin@quartos.com",
        full_name="Admin",
        is_superuser=True,
        password="supersupersecret",
    )


@pytest.fixture
def user_write() -> UserWrite:
    return UserWrite(
        email="john@quartos.com",
        full_name="John Smith",
        is_superuser=False,
        password="supersecret",
    )


@pytest.fixture
def users_db(db: Session, user_write: UserWrite, superuser_write: UserWrite) -> Session:
    CRUDUser.create(db, user_write)
    CRUDUser.create(db, superuser_write)
    return db


@pytest.fixture
def superuser_read(users_db: Session) -> UserRead:
    return CRUDUser.read_by_email(users_db, "admin@quartos.com")


@pytest.fixture
def user_read(users_db: Session) -> UserRead:
    return CRUDUser.read_by_email(users_db, "john@quartos.com")


@pytest.fixture
def superuser_client(
    db: Session, client: TestClient, superuser_read: UserRead
) -> Generator[TestClient, None, None]:
    print(superuser_read)
    app.dependency_overrides[get_current_user] = lambda: superuser_read
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def user_client(
    db: Session, client: TestClient, user_read: UserRead
) -> Generator[TestClient, None, None]:
    app.dependency_overrides[get_current_user] = lambda: user_read
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_signup(client: TestClient, db: Session) -> None:
    user = UserWrite(
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
