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
from fastapi.testclient import TestClient
from sqlmodel import Session

from app._test import db
from app.features.institution import InstitutionApiOut
from app.features.user import UserApiOut
from app.features.user._test import (
    user_read,
    user_client,
    superuser_read,
)
from app.features.userinstitutionlink._test import (
    user_institution_links_read,
)
from .crud import CRUDAccount
from .models import AccountApiIn, AccountApiOut


@pytest.fixture
def accounts_write(
    user_read: UserApiOut,
    superuser_read: UserApiOut,
    user_institution_links_read: list[InstitutionApiOut],
) -> list[AccountApiIn]:
    return [
        AccountApiIn(
            name="Savings Account",
            currency_code="EUR",
            number="111",
            type="depository",
            user_id=user_read.id,
            userinstitutionlink_id=user_institution_links_read[0].id,
            initial_balance=123.12,
            mask="1111",
        ),
        AccountApiIn(
            name="Checking Account",
            currency_code="USD",
            number="222",
            type="investment",
            userinstitutionlink_id=user_institution_links_read[1].id,
            initial_balance=123.12,
            mask="2222",
        ),
        AccountApiIn(
            name="Debit Account",
            currency_code="GBP",
            number="aaa",
            type="loan",
            userinstitutionlink_id=user_institution_links_read[2].id,
            initial_balance=123.12,
            mask="3333",
        ),
        AccountApiIn(
            name="Credit Account",
            currency_code="TWD",
            number="bbb",
            type="credit",
            userinstitutionlink_id=user_institution_links_read[0].id,
            initial_balance=123.12,
            mask="4444",
        ),
        AccountApiIn(
            name="Savings Account",
            currency_code="HKD",
            number="999",
            type="depository",
            userinstitutionlink_id=user_institution_links_read[1].id,
            initial_balance=123.12,
            mask="5555",
        ),
    ]


@pytest.fixture
def accounts_db(db: Session, accounts_write: list[AccountApiIn]) -> Session:
    for l in accounts_write:
        CRUDAccount.create(db, l)
    return db


@pytest.fixture
def accounts_read(
    accounts_db: Session,
) -> Iterable[AccountApiOut]:
    return CRUDAccount.read_many(accounts_db, 0, 0)


def test_read_many(
    user_client: TestClient,
    accounts_db: Session,
) -> None:
    response = user_client.get("/api/accounts/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5
