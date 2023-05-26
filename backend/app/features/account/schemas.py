from sqlmodel import SQLModel

from app.common.models import Base


class AccountBase(SQLModel):
    currency: str
    type: str
    number: str
    user_institution_link_id: int


class AccountRead(AccountBase, Base):
    ...


class AccountWrite(AccountBase):
    ...
