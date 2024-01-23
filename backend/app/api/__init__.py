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

from fastapi import APIRouter

from . import accounts
from . import auth
from . import exchangerate
from . import institutions
from . import replacementpatterns
from . import transactiondeserialisers
from . import transactions
from . import users
from . import categories
from . import movements

router = APIRouter()

routes = (
    (auth.router, "/auth", "auth"),
    (exchangerate.router, "/exchangerate", "exchangerate"),
    (
        transactiondeserialisers.router,
        "/transaction-deserialisers",
        "transaction-deserialisers",
    ),
    (replacementpatterns.router, "/replacement-patterns", "replacement-patterns"),
    (institutions.router, "/institutions", "institutions"),
    (users.router, "/users", "users"),
    (accounts.router, "/accounts", "accounts"),
    (movements.router, "/movements", "movements"),
    (transactions.router, "/transactions", "transactions"),
    (categories.router, "/categories", "categories"),
)

for r in routes:
    router.include_router(r[0], prefix=r[1], tags=[r[2]])
