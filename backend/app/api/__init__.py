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

from fastapi import APIRouter


from . import auth
from . import exchangerate
from . import institutions
from . import transactiondeserialisers
from . import users
from . import accounts
from . import transactions
from . import replacementpatterns

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(
    exchangerate.router, prefix="/exchangerate", tags=["exchangerate"]
)

router.include_router(
    transactiondeserialisers.router,
    prefix="/transaction-deserialisers",
    tags=["transaction-deserialisers"],
)
router.include_router(
    replacementpatterns.router,
    prefix="/replacement-patterns",
    tags=["replacement-patterns"],
)
router.include_router(
    institutions.router, prefix="/institutions", tags=["institutions"]
)
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
router.include_router(
    transactions.router, prefix="/transactions", tags=["transactions"]
)
