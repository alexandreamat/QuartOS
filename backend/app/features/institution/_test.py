from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.features.user._test import superuser_client

from app._test import client, db

from app.features.institution.schemas import InstitutionWrite
from app.features.institution.crud import CRUDInstitution


def test_read(client: TestClient, db: Session) -> None:
    response = client.get("/api/institutions/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0

    CRUDInstitution.create(db, InstitutionWrite(name="Python Bank", country_code="AD"))

    response = client.get("/api/institutions/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["name"] == "Python Bank"
    assert data[0]["country_code"] == "AD"


def test_create(superuser_client: TestClient, db: Session) -> None:
    response = superuser_client.post(
        "/api/institutions/",
        json=InstitutionWrite(name="Hello Bank", country_code="ES").dict(),
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
