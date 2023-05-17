from typing import Optional

from pydantic import BaseModel

from .base import DBBaseModel


class InstitutionBase(BaseModel):
    name: str
    country_code: str


class InstitutionInDB(InstitutionBase, DBBaseModel):
    user_id: int

    class Config:
        orm_mode = True


class InstitutionCreate(InstitutionBase):
    ...


class InstitutionRead(InstitutionInDB):
    ...


class InstitutionUpdate(InstitutionBase):
    ...
