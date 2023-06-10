import requests
from datetime import date

from fastapi import APIRouter, HTTPException, status

router = APIRouter()

API_KEY = "16d9c0af14ba42aca040064d7c7e2ff9"
BASE_URL = "https://openexchangerates.org/api"


@router.get("/")
def get_exchange_rate(
    from_currency: str, to_currency: str, date: date | None = None
) -> float:
    if date:
        date_str = date.isoformat()
        api_url = f"{BASE_URL}/historical/{date_str}.json?app_id={API_KEY}"
    else:
        api_url = f"{BASE_URL}/latest.json?app_id={API_KEY}"

    response = requests.get(api_url)
    try:
        response.raise_for_status()
    except requests.HTTPError as exc:
        raise HTTPException(status_code=exc.response.status_code)
    data = response.json()
    if from_currency not in data["rates"] or to_currency not in data["rates"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    rate: float = data["rates"][to_currency] / data["rates"][from_currency]
    return rate
