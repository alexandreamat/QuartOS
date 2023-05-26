import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.features.user._test import (
    superuser_client,
    superuser_read,
    users_db,
    user_write,
    superuser_write,
)

from app._test import client, db

from .models import InstitutionRead, InstitutionWrite
from .crud import CRUDInstitution


@pytest.fixture
def institutions_write() -> list[InstitutionWrite]:
    return [
        InstitutionWrite(name="Hello Bank", country_code="AD"),
        InstitutionWrite(name="World Bank", country_code="GB"),
        InstitutionWrite(name="Mega Bank", country_code="TW"),
    ]


@pytest.fixture
def institutions_db(db: Session, institutions_write: list[InstitutionWrite]) -> Session:
    for i in institutions_write:
        CRUDInstitution.create(db, i)
    return db


@pytest.fixture
def institutions_read(institutions_db: Session) -> list[InstitutionRead]:
    return CRUDInstitution.read_many(institutions_db)


def test_read(client: TestClient, institutions_db: Session) -> None:
    response = client.get("/api/institutions/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3
    assert data[0]["name"] == "Hello Bank"
    assert data[0]["country_code"] == "AD"


def test_create(superuser_client: TestClient, institutions_db: Session) -> None:
    response = superuser_client.post(
        "/api/institutions/",
        json=InstitutionWrite(name="The Best Bank", country_code="ES").dict(),
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
