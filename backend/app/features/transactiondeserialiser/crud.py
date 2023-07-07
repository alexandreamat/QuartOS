from app.common.crud import CRUDBase

from .models import (
    TransactionDeserialiser,
    TransactionDeserialiserApiOut,
    TransactionDeserialiserApiIn,
)


class CRUDTransactionDeserialiser(
    CRUDBase[
        TransactionDeserialiser,
        TransactionDeserialiserApiOut,
        TransactionDeserialiserApiIn,
    ],
):
    db_model = TransactionDeserialiser
    out_model = TransactionDeserialiserApiOut
