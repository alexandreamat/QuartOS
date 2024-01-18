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
from datetime import date
from decimal import Decimal

import requests
from fastapi import APIRouter, HTTPException, status

from app.features.exchangerate import get_exchange_rate

router = APIRouter()

logger = logging.getLogger(__name__)


@router.get("/")
def read_exchange_rate(from_currency: str, to_currency: str, date: date) -> Decimal:
    try:
        return get_exchange_rate(from_currency, to_currency, date)
    except requests.HTTPError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e))
