from sqlmodel import select, or_, desc, col, Session

from app.common.crud import CRUDBase

from app.features import account, userinstitutionlink

from .models import Movement, MovementApiIn, MovementApiOut


from app.features import user


class CRUDMovement(CRUDBase[Movement, MovementApiOut, MovementApiIn]):
    db_model = Movement
    api_out_model = MovementApiOut

    @classmethod
    def read_user(cls, db: Session, id: int) -> user.models.UserApiOut:
        return user.models.UserApiOut.from_orm(cls.db_model.read(db, id).user)

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
            .order_by(desc(transaction.models.Transaction.timestamp))
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
