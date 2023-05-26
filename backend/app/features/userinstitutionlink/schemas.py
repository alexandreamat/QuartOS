from sqlmodel import SQLModel

from app.common.models import Base


class InstitutionUserLinkBase(SQLModel):
    client_id: str
    institution_id: int


class UserInstitutionLinkRead(InstitutionUserLinkBase, Base):
    user_id: int


class InstitutionLinkWrite(InstitutionUserLinkBase):
    """Assumes current user"""

    ...


class UserInstitutionLinkWrite(InstitutionLinkWrite):
    user_id: int
