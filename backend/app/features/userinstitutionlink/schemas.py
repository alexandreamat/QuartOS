from pydantic import BaseModel

from app.common.schemas import OrmBase
from app.features.institution.schemas import InstitutionRead
from app.features.user.schemas import UserRead


class InstitutionUserLinkBase(BaseModel):
    client_id: str


class UserInstitutionLinkRead(InstitutionUserLinkBase, OrmBase):
    institution: InstitutionRead
    user: UserRead


class UserInstitutionLinkWrite(InstitutionUserLinkBase):
    institution_id: int


class UserInstitutionLinkDB(UserInstitutionLinkWrite):
    user_id: int
