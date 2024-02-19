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

import os
from datetime import date
from decimal import Decimal

import requests_cache

OPEN_EXCHANGE_RATES_ID = os.environ["OPEN_EXCHANGE_RATES_ID"]
BASE_URL = "https://openexchangerates.org/api"


def get_exchange_rate(from_currency: str, to_currency: str, date: date) -> Decimal:
    if from_currency == to_currency:
        return Decimal(1)

    api_url = (
        f"{BASE_URL}/historical/{date.isoformat()}.json?app_id={OPEN_EXCHANGE_RATES_ID}"
    )

    with requests_cache.CachedSession(expire_after=None) as session:
        response = session.get(api_url)
        response.raise_for_status()
        data = response.json()
        from_rate = Decimal(data["rates"][from_currency])
        to_rate = Decimal(data["rates"][to_currency])
        return to_rate / from_rate
