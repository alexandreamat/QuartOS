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
from typing import Annotated, Any, Literal

from pydantic import BaseModel, WithJsonSchema

from app.schemas.common import (
    PlaidInMixin,
    ApiInMixin,
    SyncableApiOutMixin,
    PlaidOutMixin,
    ApiOutMixin,
    CurrencyCode,
)


def AnnotatedLiteral(value: str) -> Any:
    return Annotated[
        Literal[value],
        WithJsonSchema(
            {
                "enum": [value],
                "type": {
                    str: "string",
                    bool: "boolean",
                    float: "number",
                    int: "number",
                }[type(value)],
            }
        ),
    ]


# Bases


class __AccountBase(BaseModel):
    currency_code: CurrencyCode
    initial_balance: Decimal
    name: str
    type: str


class __InstitutionalAccount(__AccountBase):
    mask: str


class __NonInstitutionalAccount(__AccountBase):
    ...


class __Depository(__InstitutionalAccount):
    type: AnnotatedLiteral("depository")


class __Loan(__InstitutionalAccount):
    type: AnnotatedLiteral("loan")
    # number: str
    # term: timedelta
    # origination_date: date
    # origination_principal_amount: Decimal


class __Credit(__InstitutionalAccount):
    type: AnnotatedLiteral("credit")


class __Investment(__InstitutionalAccount):
    type: AnnotatedLiteral("investment")


class __Brokerage(__InstitutionalAccount):
    type: AnnotatedLiteral("brokerage")


class __Other(__InstitutionalAccount):
    type: AnnotatedLiteral("other")


class __Cash(__NonInstitutionalAccount):
    type: AnnotatedLiteral("cash")


class __PersonalLedger(__NonInstitutionalAccount):
    type: AnnotatedLiteral("personal ledger")


class __Property(__NonInstitutionalAccount):
    type: AnnotatedLiteral("property")
    # address: str


class __AccountOut(BaseModel):
    balance: Decimal
    is_synced: bool


class __InstitutionalAccountOut(__AccountOut):
    userinstitutionlink_id: int
    is_institutional: AnnotatedLiteral(True)


class __NonInstitutionalAccountOut(__AccountOut):
    user_id: int
    is_institutional: AnnotatedLiteral(False)


# fmt: off

# API In

class DepositoryApiIn(__Depository, ApiInMixin): ...
class LoanApiIn(__Loan, ApiInMixin): ... 
class CreditApiIn(__Credit, ApiInMixin): ...
class InvestmentApiIn(__Investment, ApiInMixin): ...
class BrokerageApiIn(__Brokerage, ApiInMixin): ...
class OtherApiIn(__Other, ApiInMixin): ...

class CashApiIn(__Cash, ApiInMixin): ...
class PersonalLedgerApiIn(__PersonalLedger, ApiInMixin): ...
class PropertyApiIn(__Property, ApiInMixin): ... 

# API Out

class DepositoryApiOut(__Depository, __InstitutionalAccountOut, SyncableApiOutMixin): ...
class LoanApiOut(__Loan, __InstitutionalAccountOut, SyncableApiOutMixin): ...
class CreditApiOut(__Credit, __InstitutionalAccountOut, SyncableApiOutMixin): ...
class InvestmentApiOut(__Investment, __InstitutionalAccountOut, SyncableApiOutMixin): ...
class BrokerageApiOut(__Brokerage, __InstitutionalAccountOut, SyncableApiOutMixin): ...

class CashApiOut(__Cash, __NonInstitutionalAccountOut, ApiOutMixin): ...
class PersonalLedgerApiOut(__PersonalLedger, __NonInstitutionalAccountOut, ApiOutMixin): ...
class PropertyApiOut(__Property, __NonInstitutionalAccountOut, ApiOutMixin): ...

# Plaid In

class DepositoryPlaidIn(__Depository, PlaidInMixin): ...
class LoanPlaidIn(__Loan, PlaidInMixin): ...
class CreditPlaidIn(__Credit, PlaidInMixin): ...
class InvestmentPlaidIn(__Investment, PlaidInMixin): ...
class BrokeragePlaidIn(__Brokerage, PlaidInMixin): ...

# Plaid Out

class DepositoryPlaidOut(__Depository, __InstitutionalAccountOut, PlaidOutMixin): ...
class LoanPlaidOut(__Loan, __InstitutionalAccountOut, PlaidOutMixin): ...
class CreditPlaidOut(__Credit, __InstitutionalAccountOut, PlaidOutMixin): ...
class InvestmentPlaidOut(__Investment, __InstitutionalAccountOut, PlaidOutMixin): ...
class BrokeragePlaidOut(__Brokerage, __InstitutionalAccountOut, PlaidOutMixin): ...

# fmt: on

AccountApiIn = (
    DepositoryApiIn
    | LoanApiIn
    | CreditApiIn
    | BrokerageApiIn
    | InvestmentApiIn
    | CashApiIn
    | PersonalLedgerApiIn
    | PropertyApiIn
)
AccountApiOut = (
    DepositoryApiOut
    | LoanApiOut
    | CreditApiOut
    | BrokerageApiOut
    | InvestmentApiOut
    | CashApiOut
    | PersonalLedgerApiOut
    | PropertyApiOut
)
AccountPlaidIn = (
    DepositoryPlaidIn
    | LoanPlaidIn
    | CreditPlaidIn
    | InvestmentPlaidIn
    | BrokeragePlaidIn
)
AccountPlaidOut = (
    DepositoryPlaidOut
    | LoanPlaidOut
    | CreditPlaidOut
    | InvestmentPlaidOut
    | BrokeragePlaidOut
)
