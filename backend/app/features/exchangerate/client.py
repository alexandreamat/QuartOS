import os
from decimal import Decimal

import requests
import requests_cache
from datetime import date
from fastapi import HTTPException, status


API_KEY = os.environ["API_KEY"]
BASE_URL = "https://openexchangerates.org/api"

requests_cache.install_cache("exchange_rates_cache", expire_after=None)


def get_exchange_rate(from_currency: str, to_currency: str, date: date) -> Decimal:
    api_url = f"{BASE_URL}/historical/{date.isoformat()}.json?app_id={API_KEY}"

    with requests_cache.CachedSession() as session:
        response = session.get(api_url)
        response.raise_for_status()
        data = response.json()
        from_rate = Decimal(data["rates"][from_currency])
        to_rate = Decimal(data["rates"][to_currency])
        rate = to_rate / from_rate
        return rate
