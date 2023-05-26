from fastapi import APIRouter

from app.features import (
    auth,
    user,
    institution,
    userinstitutionlink,
    account,
    transaction,
)

from . import utils

api_router = APIRouter()
api_router.include_router(auth.api.router, prefix="/auth", tags=["auth"])
api_router.include_router(user.api.router, prefix="/users", tags=["users"])
api_router.include_router(
    institution.api.router, prefix="/institutions", tags=["institutions"]
)
api_router.include_router(
    userinstitutionlink.api.router,
    prefix="/institution-links",
    tags=["institution-links"],
)
api_router.include_router(account.api.router, prefix="/accounts", tags=["account"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
