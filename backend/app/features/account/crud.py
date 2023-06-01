from sqlmodel import Session
from app.common.crud import CRUDBase, CRUDSyncable

from app.features import user, institution, userinstitutionlink

from .models import (
    Account,
    AccountApiOut,
    AccountApiIn,
    AccountPlaidIn,
    AccountPlaidOut,
)


class CRUDAccount(
    CRUDBase[Account, AccountApiOut, AccountApiIn],
    CRUDSyncable[Account, AccountPlaidOut, AccountPlaidIn],
):
    db_model = Account
    api_out_model = AccountApiOut
    plaid_out_model = AccountPlaidOut

    @classmethod
    def read_user(cls, db: Session, id: int) -> user.models.UserApiOut:
        return user.models.UserApiOut.from_orm(cls.db_model.read(db, id).user)

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
    ) -> list[AccountApiOut]:
        l = userinstitutionlink.models.UserInstitutionLink.read(
            db, user_institution_link
        )
        return [cls.api_out_model.from_orm(a) for a in l.accounts]

    @classmethod
    def read_many_by_user(cls, db: Session, user_id: int) -> list[AccountApiOut]:
        db_user = user.models.User.read(db, user_id)
        return [
            cls.api_out_model.from_orm(a)
            for l in db_user.institution_links
            for a in l.accounts
        ]

    @classmethod
    def is_synced(cls, db: Session, id: int) -> bool:
        return cls.db_model.read(db, id).is_synced
