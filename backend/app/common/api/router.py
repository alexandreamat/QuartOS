from fastapi import APIRouter

from app.features import user
from app.features import institution
from app.features import auth

from . import utils

api_router = APIRouter()
api_router.include_router(auth.api.router, tags=["auth"])
api_router.include_router(user.api.router, prefix="/users", tags=["users"])
api_router.include_router(
    institution.api.router, prefix="/institutions", tags=["institutions"]
)
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
