from pydantic import BaseModel

from app.common.schemas import OrmBase


class InstitutionUserLinkBase(BaseModel):
    client_id: str
    institution_id: int


class UserInstitutionLinkRead(InstitutionUserLinkBase, OrmBase):
    user_id: int


class UserInstitutionLinkWrite(InstitutionUserLinkBase):
    ...


class UserInstitutionLinkDB(UserInstitutionLinkWrite):
    user_id: int
