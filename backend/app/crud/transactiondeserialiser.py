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

import logging
from typing import Any
from sqlalchemy import Select
from sqlalchemy.orm import Session
from app.crud.common import CRUDBase
from app.models.account import InstitutionalAccount
from app.models.institution import Institution

from app.models.transactiondeserialiser import TransactionDeserialiser
from app.models.userinstitutionlink import UserInstitutionLink
from app.schemas.transactiondeserialiser import (
    TransactionDeserialiserApiOut,
    TransactionDeserialiserApiIn,
)

logger = logging.getLogger(__name__)


class CRUDTransactionDeserialiser(
    CRUDBase[
        TransactionDeserialiser,
        TransactionDeserialiserApiOut,
        TransactionDeserialiserApiIn,
    ],
):
    db_model = TransactionDeserialiser
    out_model = TransactionDeserialiserApiOut

    @classmethod
    def select(
        cls, user_id: int | None = None, account_id: int | None = None, **kwargs: Any
    ) -> Select[tuple[TransactionDeserialiser]]:
        statement = super().select(**kwargs)
        if user_id or account_id:
            statement = statement.join(Institution)
            statement = statement.join(UserInstitutionLink)
            statement = statement.join(InstitutionalAccount)
        if user_id:
            statement = statement.where(UserInstitutionLink.user_id == user_id)
        if account_id:
            statement = statement.where(InstitutionalAccount.id == account_id)
        logger.error(statement.compile(compile_kwargs={"literal_binds": True}))
        return statement
