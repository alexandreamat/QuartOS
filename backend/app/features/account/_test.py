from typing import Iterable

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
from app.features.userinstitutionlink._test import (
    user_institution_links_read,
    user_institution_links_db,
    user_institution_links_write,
)
from app.features.institution._test import (
    institutions_read,
    institutions_db,
    institutions_write,
)

from .models import AccountApiIn, AccountApiOut
from .crud import CRUDAccount
from .models import Account


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
    return CRUDAccount.read_many(accounts_db)


def test_read_many(
    user_client: TestClient,
    accounts_db: Session,
) -> None:
    response = user_client.get("/api/accounts/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5
