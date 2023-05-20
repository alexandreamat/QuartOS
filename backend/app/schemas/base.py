from pydantic import BaseModel, validator
from sqlalchemy.orm import Query


class OrmBase(BaseModel):
    id: int

    class Config:
        orm_mode = True
