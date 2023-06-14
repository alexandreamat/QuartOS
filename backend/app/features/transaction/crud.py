from sqlmodel import Session, select, col, or_
from sqlalchemy import desc

from app.common.crud import CRUDBase, CRUDSyncable
from app.features import account, userinstitutionlink, institution, user, movement

from .models import (
    Transaction,
    TransactionApiOut,
    TransactionApiIn,
    TransactionPlaidIn,
    TransactionPlaidOut,
)


class CRUDTransaction(
    CRUDBase[Transaction, TransactionApiOut, TransactionApiIn],
    CRUDSyncable[Transaction, TransactionPlaidOut, TransactionPlaidIn],
):
    db_model = Transaction
    api_out_model = TransactionApiOut
    plaid_out_model = TransactionPlaidOut

    @classmethod
    def read_user(cls, db: Session, id: int) -> user.models.UserApiOut:
        return user.models.UserApiOut.from_orm(cls.db_model.read(db, id).user)

    @classmethod
    def read_account(cls, db: Session, id: int) -> account.models.AccountApiOut:
        return account.models.AccountApiOut.from_orm(cls.db_model.read(db, id).account)

    @classmethod
    def read_user_institution_link(
        cls, db: Session, id: int
    ) -> institution.models.InstitutionApiOut:
        return institution.models.InstitutionApiOut.from_orm(
            cls.db_model.read(db, id).userinstitutionlink
        )

    @classmethod
    def read_institution(
        cls, db: Session, id: int
    ) -> institution.models.InstitutionApiOut:
        return institution.models.InstitutionApiOut.from_orm(
            cls.db_model.read(db, id).institution
        )

    @classmethod
    def read_many_by_movement(
        cls, db: Session, movement_id: int
    ) -> list[TransactionApiOut]:
        m = movement.models.Movement.read(db, movement_id)
        return [TransactionApiOut.from_orm(t) for t in m.transactions]

    @classmethod
    def read_many_by_institution_link(
        cls, db: Session, userinstitutionlink_id: int
    ) -> list[TransactionApiOut]:
        l = userinstitutionlink.models.UserInstitutionLink.read(
            db, userinstitutionlink_id
        )
        return [
            cls.api_out_model.from_orm(t)
            for ia in l.institutionalaccounts
            for t in ia.account.transactions
        ]

    @classmethod
    def read_many_by_user(
        cls, db: Session, user_id: int, page: int, per_page: int, search: str | None
    ) -> list[TransactionApiOut]:
        offset = (page - 1) * per_page if page and per_page else 0

        statement = (
            select(Transaction)
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
            .order_by(desc(Transaction.timestamp))
        )

        if search:
            search = f"%{search}%"
            statement = statement.where(col(Transaction.name).like(search))

        if per_page:
            offset = (page - 1) * per_page
            statement = statement.offset(offset).limit(per_page)

        transactions = db.exec(statement).all()

        return [cls.api_out_model.from_orm(t) for t in transactions]

    @classmethod
    def read_many_by_account(
        cls, db: Session, account_id: int, page: int, per_page: int, search: str | None
    ) -> list[TransactionApiOut]:
        offset = (page - 1) * per_page if page and per_page else 0

        statement = (
            select(Transaction)
            .join(account.models.Account)
            .filter(account.models.Account.id == account_id)
            .order_by(desc(Transaction.timestamp))
        )

        if search:
            search = f"%{search}%"
            statement = statement.where(col(Transaction.name).like(search))

        if per_page:
            offset = (page - 1) * per_page
            statement = statement.offset(offset).limit(per_page)

        transactions = db.exec(statement).all()

        return [cls.api_out_model.from_orm(t) for t in transactions]

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return cls.db_model.read(db, id).is_synced

    @classmethod
    def create(cls, db: Session, new_schema_obj: TransactionApiIn) -> TransactionApiOut:
        new_obj_out = super().create(db, new_schema_obj)
        return new_obj_out

    @classmethod
    def update(
        cls, db: Session, id: int, new_obj_in: TransactionApiIn
    ) -> TransactionApiOut:
        new_obj_out = super().update(db, id, new_obj_in)
        return new_obj_out
