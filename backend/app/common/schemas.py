from pydantic import BaseModel


class OrmBase(BaseModel):
    id: int

    class Config:
        orm_mode = True
