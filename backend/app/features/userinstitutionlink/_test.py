import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.features.user.schemas import UserRead
from app.features.institution.schemas import InstitutionRead

from app._test import client, db
from app.features.user._test import (
    user_read,
    user_client,
    user_write,
    superuser_client,
    users_db,
    superuser_write,
    superuser_read,
)
from app.features.institution._test import (
    institutions_read,
    institutions_db,
    institutions_write,
)

from .schemas import (
    UserInstitutionLinkWrite,
    UserInstitutionLinkRead,
    InstitutionLinkWrite,
)
from .crud import CRUDUserInstitutionLink
from .model import UserInstitutionLink


@pytest.fixture
def user_institution_links_write(
    user_read: UserRead,
    superuser_read: UserRead,
    institutions_read: list[InstitutionRead],
) -> list[UserInstitutionLinkWrite]:
    return [
        UserInstitutionLinkWrite(
            client_id="123",
            user_id=user_read.id,
            institution_id=institutions_read[0].id,
        ),
        UserInstitutionLinkWrite(
            client_id="456",
            user_id=user_read.id,
            institution_id=institutions_read[1].id,
        ),
        UserInstitutionLinkWrite(
            client_id="678",
            user_id=user_read.id,
            institution_id=institutions_read[2].id,
        ),
        UserInstitutionLinkWrite(
            client_id="abc",
            user_id=superuser_read.id,
            institution_id=institutions_read[0].id,
        ),
        UserInstitutionLinkWrite(
            client_id="xyz",
            user_id=superuser_read.id,
            institution_id=institutions_read[1].id,
        ),
    ]


@pytest.fixture
def user_institution_links_db(
    db: Session, user_institution_links_write: list[UserInstitutionLinkWrite]
) -> Session:
    for l in user_institution_links_write:
        CRUDUserInstitutionLink.create(db, l)
    return db


@pytest.fixture
def user_institution_links_read(
    user_institution_links_db: Session,
) -> list[UserInstitutionLinkRead]:
    return CRUDUserInstitutionLink.read_many(user_institution_links_db)


def test_create(
    institutions_db: Session,
    user_client: TestClient,
    user_read: UserRead,
    user_institution_links_write: list[UserInstitutionLinkWrite],
) -> None:
    response = user_client.post(
        "/api/institution-links/",
        json=InstitutionLinkWrite(
            client_id=user_institution_links_write[0].client_id,
            institution_id=user_institution_links_write[0].institution_id,
        ).dict(),
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == user_read.id
    assert data["institution_id"] == user_institution_links_write[0].institution_id
    assert data["client_id"] == user_institution_links_write[0].client_id

    response = user_client.post(
        "/api/institution-links/",
        json=InstitutionLinkWrite(client_id="123", institution_id=123).dict(),
    )
    assert response.status_code == 404


def test_read(
    user_client: TestClient,
    user_read: UserRead,
    user_institution_links_db: Session,
    user_institution_links_read: list[UserInstitutionLinkRead],
) -> None:
    response = user_client.get(
        f"/api/institution-links/{user_institution_links_read[0].id}"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_institution_links_read[0].id
    assert data["user_id"] == user_institution_links_read[0].user_id
    assert data["institution_id"] == user_institution_links_read[0].institution_id
    assert data["client_id"] == user_institution_links_read[0].client_id

    response = user_client.get(
        f"/api/institution-links/{user_institution_links_read[4].id}"
    )
    assert response.status_code == 403


def test_read_many(
    user_client: TestClient,
    user_institution_links_db: Session,
) -> None:
    response = user_client.get("/api/institution-links/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3


def test_update(
    user_client: TestClient,
    user_institution_links_db: Session,
    user_institution_links_read: list[UserInstitutionLinkRead],
) -> None:
    response = user_client.put(
        f"/api/institution-links/{user_institution_links_read[0].id}",
        json=InstitutionLinkWrite(
            client_id="444333",
            institution_id=user_institution_links_read[0].institution_id,
        ).dict(),
    )
    assert response.status_code == 200
    data = response.json()
    assert data["client_id"] == "444333"

    response = user_client.put(
        f"/api/institution-links/{user_institution_links_read[0].id}",
        json=InstitutionLinkWrite(
            client_id="444333",
            institution_id=99,
        ).dict(),
    )
    assert response.status_code == 404
    user_institution_links_db.rollback()

    response = user_client.put(
        f"/api/institution-links/{user_institution_links_read[-1].id}",
        json=InstitutionLinkWrite(
            client_id="444333",
            institution_id=user_institution_links_read[-1].institution_id,
        ).dict(),
    )
    assert response.status_code == 403


def test_delete(
    user_client: TestClient,
    user_institution_links_db: Session,
    user_institution_links_read: list[UserInstitutionLinkRead],
) -> None:
    response = user_client.delete(
        f"/api/institution-links/{user_institution_links_read[0].id}",
    )
    assert response.status_code == 200
    assert not response.json()

    response = user_client.delete(
        f"/api/institution-links/{user_institution_links_read[-1].id}",
    )
    assert response.status_code == 403
