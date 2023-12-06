from sqlmodel import SQLModel
from app.common.models import Base, RegexPattern, ApiOutMixin, ApiInMixin


class __ReplacementPatternBase(SQLModel):
    pattern: RegexPattern
    replacement: str


class ReplacementPatternApiIn(__ReplacementPatternBase, ApiInMixin):
    ...


class ReplacementPatternApiOut(__ReplacementPatternBase, ApiOutMixin):
    ...


class ReplacementPattern(__ReplacementPatternBase, Base, table=True):
    ...
