from pydantic import EmailStr

from sqlmodel import SQLModel

from app.common.models import Base


class UserBase(SQLModel):
    email: EmailStr
    full_name: str
    is_superuser: bool


class UserRead(UserBase, Base):
    ...


class UserWrite(UserBase):
    password: str
