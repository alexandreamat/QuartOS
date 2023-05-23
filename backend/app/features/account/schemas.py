from pydantic import BaseModel

from app.features.institution.schemas import InstitutionRead
from app.common.schemas import OrmBase


class InstitutionUserLinkBase(BaseModel):
    client_id: str


class InstitutionUserLinkRead(InstitutionUserLinkBase, OrmBase):
    institution: InstitutionRead


class InstitutionUserLinkWrite(InstitutionUserLinkBase):
    institution_id: int
