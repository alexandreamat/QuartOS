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

import admin
import auth
import categories
import exchangerate
import institutions
import replacementpatterns
import transactiondeserialisers
import users

router = APIRouter()

routes = (
    (auth.router, "auth"),
    (exchangerate.router, "exchangerate"),
    (transactiondeserialisers.router, "transaction-deserialisers"),
    (replacementpatterns.router, "replacement-patterns"),
    (institutions.router, "institutions"),
    (users.router, "users"),
    (categories.router, "categories"),
    (admin.router, "admin"),
)

for r in routes:
    router.include_router(r[0], prefix=f"/{r[1]}", tags=[r[1]])
