from fastapi import APIRouter

from . import plaid
from . import auth
from . import exchangerate
from . import institutions
from . import transactiondeserialisers
from . import users
from . import accounts
from . import transactions

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(
    exchangerate.router, prefix="/exchangerate", tags=["exchangerate"]
)
router.include_router(
    plaid.router,
    prefix="/plaid",
    tags=[
        "plaid",
        "institution-links",
        "institutions",
        "accounts",
        "transactions",
    ],
)
router.include_router(
    transactiondeserialisers.router,
    prefix="/transaction-deserialisers",
    tags=["transaction-deserialisers"],
)
router.include_router(
    institutions.router, prefix="/institutions", tags=["institutions"]
)
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
router.include_router(
    transactions.router, prefix="/transactions", tags=["transactions"]
)
