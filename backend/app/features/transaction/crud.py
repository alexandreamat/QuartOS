from sqlmodel import Session

from app.common.crud import CRUDBase
from app.features import account, userinstitutionlink, institution, user

from .models import Transaction, TransactionRead, TransactionWrite


class CRUDTransaction(
    CRUDBase[
        Transaction,
        TransactionRead,
        TransactionWrite,
    ]
):
    db_model_type = Transaction
    read_model_type = TransactionRead
    write_model_type = TransactionWrite

    @classmethod
    def read_user(cls, db: Session, id: int) -> user.models.UserRead:
        return user.models.UserRead.from_orm(cls.db_model_type.read(db, id).user)

    @classmethod
    def read_account(cls, db: Session, id: int) -> account.models.AccountRead:
        return account.models.AccountRead.from_orm(
            cls.db_model_type.read(db, id).account
        )

    @classmethod
    def read_user_institution_link(
        cls, db: Session, id: int
    ) -> institution.models.InstitutionRead:
        return institution.models.InstitutionRead.from_orm(
            cls.db_model_type.read(db, id).user_institution_link
        )

    @classmethod
    def read_institution(
        cls, db: Session, id: int
    ) -> institution.models.InstitutionRead:
        return institution.models.InstitutionRead.from_orm(
            cls.db_model_type.read(db, id).institution
        )

    @classmethod
    def read_many_by_institution_link(
        cls, db: Session, user_institution_link: int
    ) -> list[TransactionRead]:
        l = userinstitutionlink.models.UserInstitutionLink.read(
            db, user_institution_link
        )
        return [
            cls.read_model_type.from_orm(t) for a in l.accounts for t in a.transactions
        ]

    @classmethod
    def read_many_by_user(cls, db: Session, user_id: int) -> list[TransactionRead]:
        u = user.models.User.read(db, user_id)
        return [
            cls.read_model_type.from_orm(t)
            for l in u.institution_links
            for a in l.accounts
            for t in a.transactions
        ]

    @classmethod
    def read_many_by_account(
        cls, db: Session, account_id: int
    ) -> list[TransactionRead]:
        a = account.models.Account.read(db, account_id)
        return [cls.read_model_type.from_orm(t) for t in a.transactions]

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return cls.db_model_type.read(db, id).is_synced
