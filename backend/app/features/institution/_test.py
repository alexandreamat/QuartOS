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

from typing import Iterable

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
def institutions_read(institutions_db: Session) -> Iterable[InstitutionApiOut]:
    return CRUDInstitution.read_many(institutions_db, 0, 0)


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
        ).model_dump(),
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    with pytest.raises(ValidationError):
        InstitutionApiIn(
            name="The Best Bank", country_code="NEVERLAND", url="http://bestbank.eu"
        )
