import re
from typing import TypeVar

from sqlalchemy.sql.elements import ColumnClause
from sqlmodel import or_, and_
from sqlmodel.sql.expression import SelectOfScalar
from sqlalchemy import String

from .models import Base

BaseType = TypeVar("BaseType", bound="Base")


def filter_query_by_search(
    search: str, statement: SelectOfScalar[BaseType], col: ColumnClause[String]
) -> SelectOfScalar[BaseType]:
    tokens: list[str] = re.findall(r"-?\"[^\"]+\"|-?'[^']+'|\S+", search)
    positive_clauses = []
    negative_clauses = []
    for token in tokens:
        negative = token.startswith("-")
        token_unquoted = token.strip("-'\"")
        if not token_unquoted:
            continue
        clause = col.like(f"%{token_unquoted}%")
        if negative:
            negative_clauses.append(~clause)
        else:
            positive_clauses.append(clause)
    if positive_clauses:
        statement = statement.where(or_(*positive_clauses))
    if negative_clauses:
        statement = statement.where(and_(*negative_clauses))
    return statement
