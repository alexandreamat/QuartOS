from typing import TYPE_CHECKING

from sqlmodel import select, or_, col, Session

from app.common.crud import CRUDBase
from app.features import account, userinstitutionlink

from .models import Movement, MovementApiIn, MovementApiOut


from app.features import user

if TYPE_CHECKING:
    from app.features.transaction.models import (
        TransactionApiIn,
        TransactionApiOut,
        TransactionPlaidIn,
        TransactionPlaidOut,
    )


class CRUDMovement(CRUDBase[Movement, MovementApiOut, MovementApiIn]):
    db_model = Movement
    api_out_model = MovementApiOut

    @classmethod
    def create(  # type: ignore [override]
        cls,
        db: Session,
        transaction: "TransactionApiIn | int",
    ) -> MovementApiOut:
        from app.features.transaction.crud import CRUDTransaction
        from app.features.transaction.models import Transaction, TransactionApiIn

        new_movement = super().create(db, MovementApiIn())

        if isinstance(transaction, TransactionApiIn):
            transaction.movement_id = new_movement.id
            CRUDTransaction.create(db, transaction)
        else:  # int
            transaction_db = Transaction.read(db, transaction)
            old_movement = Movement.read(db, transaction_db.movement_id)
            transaction_db.movement_id = new_movement.id
            Transaction.update(db, transaction, transaction_db)
            if not old_movement.transactions:
                Movement.delete(db, old_movement.id)

        return CRUDMovement.read(db, new_movement.id)

    @classmethod
    def sync(cls, db: Session, transaction: "TransactionPlaidIn") -> MovementApiOut:
        from app.features.transaction.crud import CRUDTransaction

        movement = super().create(db, MovementApiIn())
        transaction.movement_id = movement.id
        CRUDTransaction.sync(db, transaction)

        return CRUDMovement.read(db, movement.id)

    @classmethod
    def read_user(cls, db: Session, id: int) -> user.models.UserApiOut:
        return user.models.UserApiOut.from_orm(Movement.read(db, id).user)

    @classmethod
    def read_many_by_user(
        cls, db: Session, user_id: int, page: int, per_page: int, search: str | None
    ) -> list[MovementApiOut]:
        from app.features import transaction

        offset = (page - 1) * per_page if page and per_page else 0
        MovementApiOut.update_forward_refs()
        statement = (
            select(Movement)
            .join(transaction.models.Transaction)
            .join(account.models.Account)
            .outerjoin(account.models.Account.InstitutionalAccount)
            .outerjoin(account.models.Account.NonInstitutionalAccount)
            .outerjoin(userinstitutionlink.models.UserInstitutionLink)
            .where(
                or_(
                    userinstitutionlink.models.UserInstitutionLink.user_id == user_id,
                    account.models.Account.NonInstitutionalAccount.user_id == user_id,
                )
            )
            .group_by(Movement.id)
            .order_by(*transaction.models.Transaction.get_desc_clauses())
        )

        if search:
            search = f"%{search}%"
            statement = statement.where(
                col(transaction.models.Transaction.name).like(search)
            )

        if per_page:
            offset = (page - 1) * per_page
            statement = statement.offset(offset).limit(per_page)

        movements = db.exec(statement).all()

        return [MovementApiOut.from_orm(m) for m in movements]

    @classmethod
    def add_transaction(
        cls, db: Session, id: int, transaction_in: "TransactionApiIn"
    ) -> MovementApiOut:
        from app.features.transaction.crud import CRUDTransaction

        movement = Movement.read(db, id)
        transaction_in.movement_id = movement.id
        CRUDTransaction.create(db, transaction_in)
        return CRUDMovement.read(db, id)

    @classmethod
    def update_transaction(
        cls,
        db: Session,
        id: int,
        transaction_id: int,
        transaction_in: "TransactionApiIn",
    ) -> "TransactionApiOut":
        from app.features.transaction.crud import CRUDTransaction

        movement = Movement.read(db, id)
        transaction_out = CRUDTransaction.update(db, transaction_id, transaction_in)
        if not movement.transactions:
            cls.delete(db, id)
        return transaction_out

    @classmethod
    def resync_transaction(
        cls,
        db: Session,
        id: int,
        transaction_id: int,
        transaction_in: "TransactionPlaidIn",
    ) -> "TransactionPlaidOut":
        from app.features.transaction.crud import CRUDTransaction

        return CRUDTransaction.resync(db, transaction_id, transaction_in)

    @classmethod
    def delete_transaction(cls, db: Session, id: int, transaction_id: int) -> None:
        from app.features.transaction.crud import CRUDTransaction

        movement = Movement.read(db, id)
        CRUDTransaction.delete(db, transaction_id)
        if not movement.transactions:
            cls.delete(db, id)
