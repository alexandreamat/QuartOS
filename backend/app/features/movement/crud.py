from sqlmodel import select, or_, desc, col, Session

from app.common.crud import CRUDBase

from app.features import transaction, account, userinstitutionlink

from .models import Movement, MovementApiIn, MovementApiOut


class CRUDMovement(CRUDBase[Movement, MovementApiOut, MovementApiIn]):
    @classmethod
    def read_many_by_user(
        cls, db: Session, user_id: int, page: int, per_page: int, search: str | None
    ) -> list[MovementApiOut]:
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
