# Copyright (C) 2024 Alexandre Amat
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

import re
from typing import TypeVar

from sqlalchemy import String
from sqlalchemy.sql.elements import ColumnClause
from sqlmodel import or_, and_
from sqlmodel.sql.expression import SelectOfScalar

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
