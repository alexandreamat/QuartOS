from fastapi import FastAPI

from app import features

from app import initial_data
from app.settings import settings
from app.api import api_router


initial_data.main()

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_STR}/openapi.json"
)

app.include_router(api_router, prefix=settings.API_STR)
