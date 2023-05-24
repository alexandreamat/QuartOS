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


@pytest.fixture
def user_institution_links_write(
    user_read: UserRead, institutions_read: list[InstitutionRead]
) -> list[UserInstitutionLinkWrite]:
    return [
        UserInstitutionLinkWrite(
            client_id="123456L", user_id=user_read.id, institution_id=i.id
        )
        for i in institutions_read
    ]


@pytest.fixture
def user_institution_links_db(
    db: Session, user_institution_links_write: list[UserInstitutionLinkWrite]
) -> Session:
    CRUDUserInstitutionLink.create(db, user_institution_links_write[0])
    CRUDUserInstitutionLink.create(db, user_institution_links_write[1])
    return db


@pytest.fixture
def user_institution_links_read(
    user_institution_links_db: Session,
) -> list[UserInstitutionLinkRead]:
    return CRUDUserInstitutionLink.read_many(user_institution_links_db)


def test_create(
    user_institution_links_db: Session,
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
    assert data
    assert data["user_id"] == user_read.id
    assert data["institution_id"] == user_institution_links_write[0].institution_id
    assert data["client_id"] == user_institution_links_write[0].client_id
