from typing import Generator
from fastapi.testclient import TestClient
import pytest
from sqlalchemy.orm import Session
from app.features.user.deps import get_current_user
from app.features.user.schemas import UserRead
from app.main import app

from app._test import db, client

from .schemas import UserWrite


@pytest.fixture
def superuser_client(
    db: Session, client: TestClient
) -> Generator[TestClient, None, None]:
    superuser = UserRead(
        id=1, email="admin@quartos.com", full_name="Admin", is_superuser=True
    )
    app.dependency_overrides[get_current_user] = lambda: superuser
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def user_client(db: Session, client: TestClient) -> Generator[TestClient, None, None]:
    user = UserRead(
        id=1, email="john@quartos.com", full_name="John Smith", is_superuser=False
    )
    app.dependency_overrides[get_current_user] = lambda: user
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


def test_read_me(user_client: TestClient, db: Session) -> None:
    response = user_client.get("api/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["id"]
    assert data["email"] == "john@quartos.com"
    assert data["full_name"] == "John Smith"
    assert data["is_superuser"] == False
