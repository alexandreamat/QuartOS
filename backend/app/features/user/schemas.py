from pydantic import BaseModel, EmailStr

from app.common.schemas import OrmBase


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_superuser: bool


class UserInDB(UserBase, OrmBase):
    hashed_password: str


class UserRead(UserBase, OrmBase):
    ...


class UserWrite(UserBase):
    password: str
