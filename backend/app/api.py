from fastapi import APIRouter

from app.features import (
    auth,
    user,
    institution,
    userinstitutionlink,
    movement,
    account,
    transaction,
    transactiondeserialiser,
    plaid,
    exchangerate,
)


AUTH = "auth"
TRANSACTION_DESERIALISERS = "transaction-deserialisers"
USERS = "users"
INSTITUTIONS = "institutions"
INSTITUTION_LINKS = "institution-links"
ACCOUNTS = "accounts"
MOVEMENTS = "movements"
TRANSACTIONS = "transactions"
PLAID = "plaid"
EXCHANGERATE = "exchangerate"

api_router = APIRouter()

api_router.include_router(auth.router, prefix=f"/{AUTH}", tags=[AUTH])
api_router.include_router(
    transactiondeserialiser.api.router,
    prefix=f"/{TRANSACTION_DESERIALISERS}",
    tags=[TRANSACTION_DESERIALISERS],
)
api_router.include_router(user.router, prefix=f"/{USERS}", tags=[USERS])
api_router.include_router(
    exchangerate.router, prefix=f"/{EXCHANGERATE}", tags=[EXCHANGERATE]
)
api_router.include_router(
    institution.router, prefix=f"/{INSTITUTIONS}", tags=[INSTITUTIONS]
)
api_router.include_router(
    userinstitutionlink.router,
    prefix=f"/{INSTITUTION_LINKS}",
    tags=[INSTITUTION_LINKS],
)
api_router.include_router(account.router, prefix=f"/{ACCOUNTS}", tags=[ACCOUNTS])
api_router.include_router(movement.router, prefix=f"/{MOVEMENTS}", tags=[MOVEMENTS])
api_router.include_router(
    transaction.router, prefix=f"/{TRANSACTIONS}", tags=[TRANSACTIONS]
)
api_router.include_router(
    plaid.router,
    prefix=f"/{PLAID}",
    tags=[PLAID, INSTITUTION_LINKS, INSTITUTIONS, ACCOUNTS, TRANSACTIONS],
)
