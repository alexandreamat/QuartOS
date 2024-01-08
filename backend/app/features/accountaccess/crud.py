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

from app.common.crud import CRUDBase
from .models import (
    AccountAccess,
    AccountAccessApiIn,
    AccountAccessApiOut,
    NonInstitutionalAccountAccessApiOut,
    InstitutionalAccountAccessApiIn,
)


class CRUDAccountAccess(
    CRUDBase[AccountAccess, AccountAccessApiOut, AccountAccessApiIn]
):
    db_model = AccountAccess

    OUT_MODELS = {
        True: InstitutionalAccountAccessApiIn,
        False: NonInstitutionalAccountAccessApiOut,
    }

    @classmethod
    def out_model_validate(cls, db_obj: AccountAccess):
        return cls.OUT_MODELS[db_obj.is_institutional].model_validate(db_obj)
