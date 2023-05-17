from typing import Optional

from pydantic import BaseModel, EmailStr

from .base import DBBaseModel


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None


class UserInDBBase(UserBase, DBBaseModel):
    is_superuser: bool = False

    class Config:
        orm_mode = True


class UserInDB(UserInDBBase):
    hashed_password: str


class UserCreate(UserBase):
    password: str


class UserRead(UserInDBBase):
    ...


class UserUpdate(UserBase):
    password: str
