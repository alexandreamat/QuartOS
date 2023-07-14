from fastapi.testclient import TestClient
from sqlmodel import Session

from app.features.user import UserApiIn, CRUDUser
from app._test import client, db


def test_login(client: TestClient, db: Session) -> None:
    CRUDUser.create(
        db,
        UserApiIn(
            email="test@example.com",
            password="supersecretpassword",
            full_name="Test User",
            is_superuser=False,
        ),
    )

    response = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "supersecretpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["access_token"]
    assert data["token_type"] == "bearer"
