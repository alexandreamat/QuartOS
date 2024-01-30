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

# 1. Import base model
from app.common.models import Base

# 2. Import inheritors of the base model
from app.features.account import Account
from app.features.category import Category
from app.features.institution import Institution
from app.features.merchant import Merchant
from app.features.movement import Movement
from app.features.replacementpattern import ReplacementPattern
from app.features.transaction import Transaction
from app.features.transactiondeserialiser import TransactionDeserialiser
from app.features.user import User
from app.features.userinstitutionlink import UserInstitutionLink

# 3. Import this file from Alembic
__all__ = [
    "Base",
    "ReplacementPattern",
    "TransactionDeserialiser",
    "User",
    "Institution",
    "UserInstitutionLink",
    "Account",
    "Movement",
    "Transaction",
    "Merchant",
    "Category",
]
