from fastapi import FastAPI

from app.features.exchangerate import api as exchangerate_api
from app.features.auth import api as auth_api
from app.features.user import api as user_api
from app.features.transactiondeserialiser import api as transactiondeserialiser_api
from app.features.institution import api as institution_api
from app.features.userinstitutionlink import api as userinstitutionlink_api
from app.features.account import api as account_api
from app.features.transaction import api as transaction_api
from app.features.movement import api as movement_api
from app.features.plaid import api as plaid_api

from app import initial_data
from app.settings import settings
from app.api import api_router


initial_data.main()

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_STR}/openapi.json"
)

app.include_router(api_router, prefix=settings.API_STR)
