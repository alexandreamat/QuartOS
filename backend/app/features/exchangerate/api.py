import requests

from fastapi import APIRouter, HTTPException, status


router = APIRouter()


@router.get("/")
def get_exchange_rate(from_currency: str, to_currency: str) -> float:
    api_key = "16d9c0af14ba42aca040064d7c7e2ff9"
    api_url = f"https://openexchangerates.org/api/latest.json?app_id={api_key}"
    response = requests.get(api_url)
    response.raise_for_status()
    data = response.json()
    if from_currency not in data["rates"] or to_currency not in data["rates"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST)
    rate: float = data["rates"][to_currency] / data["rates"][from_currency]
    return rate
