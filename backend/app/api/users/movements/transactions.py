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

from fastapi import APIRouter

from app.database.deps import DBSession
from app.features.transaction.models import TransactionApiOut
from app.features.user.crud import CRUDUser
from app.features.user.deps import CurrentUser

router = APIRouter()


@router.get("/")
def read_many(
    db: DBSession, me: CurrentUser, movement_id: int
) -> Iterable[TransactionApiOut]:
    return CRUDUser.read_transactions(db, me.id, movement_id=movement_id)
