from typing import Iterable, Any

from sqlmodel import Session

from app.utils import get_password_hash
from app.common.crud import CRUDBase

from app.features.userinstitutionlink import UserInstitutionLinkApiOut
from app.features.transaction import TransactionApiOut
from app.features.account import AccountApiOut
from app.features.movement import MovementApiOut, PLStatement

from .models import User, UserApiOut, UserApiIn


class CRUDUser(CRUDBase[User, UserApiOut, UserApiIn]):
    db_model = User
    out_model = UserApiOut

    @classmethod
    def create(cls, db: Session, new_schema_obj: UserApiIn) -> UserApiOut:
        hashed_password = get_password_hash(new_schema_obj.password)
        del new_schema_obj.password
        db_obj_in = User.from_schema(new_schema_obj)
        db_obj_in.hashed_password = hashed_password
        db_obj_out = User.create(db, db_obj_in)
        return UserApiOut.from_orm(db_obj_out)

    @classmethod
    def read_by_email(cls, db: Session, email: str) -> UserApiOut:
        return UserApiOut.from_orm(User.read_by_email(db, email=email))

    @classmethod
    def update(cls, db: Session, id: int, new_schema_obj: UserApiIn) -> UserApiOut:
        hashed_password = get_password_hash(new_schema_obj.password)
        del new_schema_obj.password
        db_obj_in = User.from_schema(new_schema_obj)
        db_obj_in.hashed_password = hashed_password
        db_obj_out = User.update(db, id, db_obj_in)
        return UserApiOut.from_orm(db_obj_out)

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> UserApiOut:
        return UserApiOut.from_orm(User.authenticate(db, email, password))

    @classmethod
    def read_user_institution_links(
        cls, db: Session, id: int
    ) -> Iterable[UserInstitutionLinkApiOut]:
        for obj in User.read(db, id).institution_links:
            yield UserInstitutionLinkApiOut.from_orm(obj)

    @classmethod
    def read_transactions(
        cls, db: Session, id: int, *args: Any, **kwargs: Any
    ) -> Iterable[TransactionApiOut]:
        for t in User.read_transactions(db, id, *args, **kwargs):
            yield TransactionApiOut.from_orm(t)

    @classmethod
    def read_accounts(cls, db: Session, user_id: int) -> Iterable[AccountApiOut]:
        db_user = User.read(db, user_id)
        for l in db_user.institution_links:
            for ia in l.institutionalaccounts:
                yield AccountApiOut.from_orm(ia.account)
        for nia in db_user.noninstitutionalaccounts:
            yield AccountApiOut.from_orm(nia.account)

    @classmethod
    def read_movements(
        cls, db: Session, id: int, *args: Any, **kwargs: Any
    ) -> Iterable[MovementApiOut]:
        for m in User.read_movements(db, id, *args, **kwargs):
            yield MovementApiOut.from_orm(m)

    @classmethod
    def get_movement_aggregate(
        cls, db: Session, id: int, *args: Any, **kwargs: Any
    ) -> PLStatement:
        return User.get_movement_aggregate(db, id, *args, **kwargs)

    @classmethod
    def get_many_movement_aggregates(
        cls, db: Session, id: int, *args: Any, **kwargs: Any
    ) -> Iterable[PLStatement]:
        return User.get_many_movement_aggregates(db, id, *args, **kwargs)
