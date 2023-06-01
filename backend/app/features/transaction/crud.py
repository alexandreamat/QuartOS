from sqlmodel import Session

from app.common.crud import CRUDBase, CRUDSyncable
from app.features import account, userinstitutionlink, institution, user

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
            cls.db_model.read(db, id).user_institution_link
        )

    @classmethod
    def read_institution(
        cls, db: Session, id: int
    ) -> institution.models.InstitutionApiOut:
        return institution.models.InstitutionApiOut.from_orm(
            cls.db_model.read(db, id).institution
        )

    @classmethod
    def read_many_by_institution_link(
        cls, db: Session, user_institution_link: int
    ) -> list[TransactionApiOut]:
        l = userinstitutionlink.models.UserInstitutionLink.read(
            db, user_institution_link
        )
        return [
            cls.api_out_model.from_orm(t) for a in l.accounts for t in a.transactions
        ]

    @classmethod
    def read_many_by_user(cls, db: Session, user_id: int) -> list[TransactionApiOut]:
        u = user.models.User.read(db, user_id)
        return [
            cls.api_out_model.from_orm(t)
            for l in u.institution_links
            for a in l.accounts
            for t in a.transactions
        ]

    @classmethod
    def read_many_by_account(
        cls, db: Session, account_id: int
    ) -> list[TransactionApiOut]:
        a = account.models.Account.read(db, account_id)
        return [cls.api_out_model.from_orm(t) for t in a.transactions]

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return cls.db_model.read(db, id).is_synced
