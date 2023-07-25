from decimal import Decimal
from datetime import date

import requests
from fastapi import APIRouter, HTTPException, status

from app.features.exchangerate import get_exchange_rate

router = APIRouter()


@router.get("/")
def read_exchange_rate(from_currency: str, to_currency: str, date: date) -> Decimal:
    try:
        return get_exchange_rate(from_currency, to_currency, date)
    except requests.HTTPError as exc:
        raise HTTPException(status_code=exc.response.status_code)
    except KeyError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
