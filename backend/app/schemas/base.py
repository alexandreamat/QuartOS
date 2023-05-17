from pydantic import BaseModel


class DBBaseModel(BaseModel):
    id: int
