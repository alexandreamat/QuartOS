import pytest
from pydantic import ValidationError
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

from .models import InstitutionApiOut, InstitutionApiIn
from .crud import CRUDInstitution


@pytest.fixture
def institutions_write() -> list[InstitutionApiIn]:
    return [
        InstitutionApiIn(
            name="Hello Bank", country_code="AD", url="https://www.hello.com"
        ),
        InstitutionApiIn(
            name="World Bank", country_code="GB", url="https://www.worldbank.com"
        ),
        InstitutionApiIn(
            name="Mega Bank", country_code="TW", url="https://www.mega.com"
        ),
    ]


@pytest.fixture
def institutions_db(db: Session, institutions_write: list[InstitutionApiIn]) -> Session:
    for i in institutions_write:
        CRUDInstitution.create(db, i)
    return db


@pytest.fixture
def institutions_read(institutions_db: Session) -> list[InstitutionApiOut]:
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
        json=InstitutionApiIn(
            name="The Best Bank", country_code="ES", url="http://bestbank.eu"
        ).dict(),
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    with pytest.raises(ValidationError):
        InstitutionApiIn(
            name="The Best Bank", country_code="NEVERLAND", url="http://bestbank.eu"
        )
