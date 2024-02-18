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
from typing import Iterable

from sqlalchemy.orm import Session

from app.common.crud import CRUDBase
from .models import Movement
from .schemas import MovementApiIn, MovementApiOut

logger = logging.getLogger(__name__)


class CRUDMovement(CRUDBase[Movement, MovementApiOut, MovementApiIn]):
    db_model = Movement
    out_model = MovementApiOut

    # @classmethod
    # def merge(cls, db: Session, movement_ids: list[int]) -> MovementApiOut:
    #     transaction_ids = [
    #         transaction.id
    #         for movement_id in movement_ids
    #         for transaction in Movement.read(db, movement_id).transactions
    #     ]
    #     return cls.create(db, transaction_ids)

    @classmethod
    def update_categories(cls, db: Session) -> Iterable[MovementApiOut]:
        for m in cls.read_many(db, 0, 0):
            yield MovementApiOut.model_validate(
                Movement.update(db, m.id, category_id=m.category_id)
            )
