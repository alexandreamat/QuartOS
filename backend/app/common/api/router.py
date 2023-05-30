from fastapi import APIRouter

from app.features import (
    auth,
    user,
    institution,
    userinstitutionlink,
    account,
    transaction,
    plaid,
)

from . import utils

AUTH = "auth"
USERS = "users"
INSTITUTIONS = "institutions"
INSTITUTION_LINKS = "institution-links"
ACCOUNTS = "accounts"
TRANSACTIONS = "transactions"
UTILS = "utils"
PLAID = "plaid"

api_router = APIRouter()

api_router.include_router(auth.api.router, prefix=f"/{AUTH}", tags=[AUTH])
api_router.include_router(user.api.router, prefix=f"/{USERS}", tags=[USERS])
api_router.include_router(
    institution.api.router, prefix=f"/{INSTITUTIONS}", tags=[INSTITUTIONS]
)
api_router.include_router(
    userinstitutionlink.api.router,
    prefix=f"/{INSTITUTION_LINKS}",
    tags=[INSTITUTION_LINKS],
)
api_router.include_router(account.api.router, prefix=f"/{ACCOUNTS}", tags=[ACCOUNTS])
api_router.include_router(
    transaction.api.router, prefix=f"/{TRANSACTIONS}", tags=[TRANSACTIONS]
)
api_router.include_router(utils.router, prefix=f"/{UTILS}", tags=[UTILS])
api_router.include_router(
    plaid.api.router,
    prefix=f"/{PLAID}",
    tags=[PLAID, INSTITUTION_LINKS, INSTITUTIONS, ACCOUNTS],
)
