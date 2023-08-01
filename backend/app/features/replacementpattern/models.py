from sqlmodel import SQLModel
from app.common.models import Base, RegexPattern


class __ReplacementPatternBase(SQLModel):
    pattern: RegexPattern
    replacement: str


class ReplacementPatternApiIn(__ReplacementPatternBase):
    ...


class ReplacementPatternApiOut(__ReplacementPatternBase, Base):
    ...


class ReplacementPattern(__ReplacementPatternBase, Base, table=True):
    ...
