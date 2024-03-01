# Copyright (C) 2023 Alexandre Amat
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

# 2. Import inheritors of the base model
from app.models.account import Account
from app.models.category import Category

# 1. Import base model
from app.models.common import Base
from app.models.institution import Institution
from app.models.merchant import Merchant
from app.models.transactiongroup import TransactionGroup
from app.models.replacementpattern import ReplacementPattern
from app.models.transaction import Transaction
from app.models.transactiondeserialiser import TransactionDeserialiser
from app.models.user import User
from app.models.userinstitutionlink import UserInstitutionLink

# 3. Import this file from Alembic
__all__ = [
    "Base",
    "ReplacementPattern",
    "TransactionDeserialiser",
    "User",
    "Institution",
    "UserInstitutionLink",
    "Account",
    "TransactionGroup",
    "Transaction",
    "Merchant",
    "Category",
]
