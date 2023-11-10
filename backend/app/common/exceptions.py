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

from typing import Any, Dict
from fastapi import HTTPException, status


class UnknownError(HTTPException):
    def __init__(self, e: Exception) -> None:
        exc_message = getattr(e, "message", str(e))
        error_message = f"{type(e).__name__}: {exc_message}"
        raise HTTPException(status.HTTP_400_BAD_REQUEST, error_message)


class ObjectNotFoundError(HTTPException):
    def __init__(self, name: str, id: int | None = None) -> None:
        if id:
            super().__init__(status.HTTP_404_NOT_FOUND, f"{name} {id} not found")
        else:
            super().__init__(status.HTTP_404_NOT_FOUND, f"{name} not found")
