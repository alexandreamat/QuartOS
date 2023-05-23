from pydantic import BaseModel

from app.common.schemas import OrmBase


class AccountBase(BaseModel):
    currency: str
    type: str
    number: str
    user_institution_link_id: int


class AccountRead(AccountBase, OrmBase):
    ...


class AccountWrite(AccountBase):
    ...
