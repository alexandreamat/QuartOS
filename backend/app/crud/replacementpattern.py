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

from typing import Any
from sqlalchemy import Select
from app.crud.common import CRUDBase
from app.models.institution import Institution

from app.models.replacementpattern import ReplacementPattern
from app.models.userinstitutionlink import UserInstitutionLink
from app.schemas.replacementpattern import (
    ReplacementPatternApiIn,
    ReplacementPatternApiOut,
)


class CRUDReplacementPattern(
    CRUDBase[ReplacementPattern, ReplacementPatternApiOut, ReplacementPatternApiIn]
):
    __model__ = ReplacementPattern
    __out_schema__ = ReplacementPatternApiOut

    @classmethod
    def select(
        cls, user_institution_link_id: int | None = None, **kwargs: Any
    ) -> Select[tuple[ReplacementPattern]]:
        statement = super().select(**kwargs)
        if user_institution_link_id:
            statement = statement.join(Institution).join(UserInstitutionLink)
            statement = statement.where(UserInstitutionLink.id == statement)
        return statement
