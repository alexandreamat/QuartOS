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

from decimal import Decimal
from typing import TYPE_CHECKING, TypeVar

from sqlalchemy import ForeignKey, desc
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import (
    Mapped,
    relationship,
    mapped_column,
    WriteOnlyMapped,
    object_session,
)

from app.models.common import Base, SyncableBase
from app.models.transaction import Transaction
from app.models.transactiondeserialiser import TransactionDeserialiser

if TYPE_CHECKING:
    # from app.models.bucket import Bucket
    from app.models.userinstitutionlink import UserInstitutionLink

ModelType = TypeVar("ModelType", bound=Base)


class Account(SyncableBase):
    __tablename__ = "account"

    currency_code: Mapped[str]
    initial_balance: Mapped[Decimal]
    name: Mapped[str]
    type: Mapped[str]

    transactions: WriteOnlyMapped[Transaction] = relationship(
        back_populates="account",
        cascade="all, delete",
        order_by=(desc(Transaction.timestamp), desc(Transaction.id)),
    )
    default_bucket_id: Mapped[int | None] = mapped_column(ForeignKey("bucket.id"))

    # default_bucket: Mapped["Bucket | None"] = relationship()

    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": "account",
    }

    @hybrid_property
    def balance(self) -> Decimal:
        session = object_session(self)
        assert session
        transaction = session.scalars(self.transactions.select()).first()
        if transaction:
            return transaction.account_balance
        return self.initial_balance


class InstitutionalAccount(Account):
    is_institutional = True
    mask: Mapped[str | None]
    user_institution_link_id: Mapped[int] = mapped_column(
        ForeignKey("user_institution_link.id")
    )

    user_institution_link: Mapped["UserInstitutionLink"] = relationship(
        back_populates="institutionalaccounts"
    )

    __mapper_args__ = {"polymorphic_abstract": True}

    @property
    def transaction_deserialiser(self) -> TransactionDeserialiser | None:
        return self.user_institution_link.institution.transaction_deserialiser


class Investment(InstitutionalAccount):
    __mapper_args__ = {"polymorphic_identity": "investment"}


class Credit(InstitutionalAccount):
    __mapper_args__ = {"polymorphic_identity": "credit"}


class Depository(InstitutionalAccount):
    __mapper_args__ = {"polymorphic_identity": "depository"}


class Loan(InstitutionalAccount):
    # number: str
    # term: timedelta
    # origination_date: date
    # origination_principal_amount: Decimal
    __mapper_args__ = {"polymorphic_identity": "loan"}


class Brokerage(InstitutionalAccount):
    __mapper_args__ = {"polymorphic_identity": "brokerage"}


class Other(InstitutionalAccount):
    __mapper_args__ = {"polymorphic_identity": "other"}


class NonInstitutionalAccount(Account):
    is_institutional = False
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))

    __mapper_args__ = {"polymorphic_abstract": True}


class PersonalLedger(NonInstitutionalAccount):
    __mapper_args__ = {"polymorphic_identity": "personal ledger"}


class Cash(NonInstitutionalAccount):
    __mapper_args__ = {"polymorphic_identity": "cash"}


class Property(NonInstitutionalAccount):
    # address: str
    __mapper_args__ = {"polymorphic_identity": "property"}
