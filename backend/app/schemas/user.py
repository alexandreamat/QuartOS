from pydantic import BaseModel, EmailStr

from .base import OrmBase


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None


class UserInDBBase(UserBase, OrmBase):
    is_superuser: bool = False


class UserInDB(UserInDBBase):
    hashed_password: str


class UserRead(UserInDBBase):
    ...


class UserWrite(UserBase):
    password: str
