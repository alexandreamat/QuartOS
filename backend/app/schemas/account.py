from typing import TYPE_CHECKING

from pydantic import BaseModel
from typing import Literal


from .base import OrmBase
from .institution import InstitutionBase


class InstitutionUserLinkBase(BaseModel):
    client_id: str


class InstitutionUserLinkRead(InstitutionUserLinkBase, OrmBase):
    institution: InstitutionBase


class InstitutionUserLinkWrite(InstitutionUserLinkBase):
    institution_id: int
