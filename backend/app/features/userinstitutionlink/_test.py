import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from sqlalchemy.exc import NoResultFound

from app.features.user.models import UserApiOut
from app.features.institution.models import InstitutionApiOut

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

from .models import (
    UserInstitutionLinkApiIn,
    UserInstitutionLinkApiOut,
    InstitutionLinkApiIn,
    UserInstitutionLink,
)
from .crud import CRUDUserInstitutionLink


@pytest.fixture
def user_institution_links_write(
    user_read: UserApiOut,
    superuser_read: UserApiOut,
    institutions_read: list[InstitutionApiOut],
) -> list[UserInstitutionLinkApiIn]:
    return [
        UserInstitutionLinkApiIn(
            user_id=user_read.id,
            institution_id=institutions_read[0].id,
        ),
        UserInstitutionLinkApiIn(
            user_id=user_read.id,
            institution_id=institutions_read[1].id,
        ),
        UserInstitutionLinkApiIn(
            user_id=user_read.id,
            institution_id=institutions_read[2].id,
        ),
        UserInstitutionLinkApiIn(
            user_id=superuser_read.id,
            institution_id=institutions_read[0].id,
        ),
        UserInstitutionLinkApiIn(
            user_id=superuser_read.id,
            institution_id=institutions_read[1].id,
        ),
    ]


@pytest.fixture
def user_institution_links_db(
    db: Session, user_institution_links_write: list[UserInstitutionLinkApiIn]
) -> Session:
    for l in user_institution_links_write:
        CRUDUserInstitutionLink.create(db, l)
    return db


@pytest.fixture
def user_institution_links_read(
    user_institution_links_db: Session,
) -> list[UserInstitutionLinkApiOut]:
    return CRUDUserInstitutionLink.read_many(user_institution_links_db)


def test_create(
    institutions_db: Session,
    user_client: TestClient,
    user_read: UserApiOut,
    user_institution_links_write: list[UserInstitutionLinkApiIn],
) -> None:
    response = user_client.post(
        "/api/institution-links/",
        json=InstitutionLinkApiIn(
            institution_id=user_institution_links_write[0].institution_id,
        ).dict(),
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == user_read.id
    assert data["institution_id"] == user_institution_links_write[0].institution_id

    response = user_client.post(
        "/api/institution-links/",
        json=InstitutionLinkApiIn(institution_id=123).dict(),
    )
    assert response.status_code == 404


def test_read(
    user_client: TestClient,
    user_read: UserApiOut,
    user_institution_links_db: Session,
    user_institution_links_read: list[UserInstitutionLinkApiOut],
) -> None:
    response = user_client.get(
        f"/api/institution-links/{user_institution_links_read[0].id}"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_institution_links_read[0].id
    assert data["user_id"] == user_institution_links_read[0].user_id
    assert data["institution_id"] == user_institution_links_read[0].institution_id

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
    user_institution_links_read: list[UserInstitutionLinkApiOut],
) -> None:
    response = user_client.put(
        f"/api/institution-links/{user_institution_links_read[0].id}",
        json=InstitutionLinkApiIn(
            institution_id=user_institution_links_read[0].institution_id,
        ).dict(),
    )
    assert response.status_code == 200
    data = response.json()

    response = user_client.put(
        f"/api/institution-links/{user_institution_links_read[0].id}",
        json=InstitutionLinkApiIn(
            institution_id=99,
        ).dict(),
    )
    assert response.status_code == 404
    user_institution_links_db.rollback()

    response = user_client.put(
        f"/api/institution-links/{user_institution_links_read[-1].id}",
        json=InstitutionLinkApiIn(
            institution_id=user_institution_links_read[-1].institution_id,
        ).dict(),
    )
    assert response.status_code == 403


def test_delete(
    user_client: TestClient,
    user_institution_links_db: Session,
    user_institution_links_read: list[UserInstitutionLinkApiOut],
) -> None:
    id = user_institution_links_read[0].id
    response = user_client.delete(f"/api/institution-links/{id}")
    assert response.status_code == 200
    assert not response.json()

    with pytest.raises(NoResultFound):
        CRUDUserInstitutionLink.read(user_institution_links_db, id)

    response = user_client.delete(
        f"/api/institution-links/{user_institution_links_read[-1].id}",
    )
    assert response.status_code == 403
