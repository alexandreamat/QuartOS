# Copyright (C) 2023 Alexandre Amat
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

from typing import Generator, Annotated
import logging

from sqlalchemy import event
from fastapi import Depends
from sqlmodel import create_engine, Session

from app.settings import settings


connect_args = {"check_same_thread": False}
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    connect_args=connect_args,
    # echo="debug",
    # echo=True,
    # query_cache_size=0,
)

# Enforce foreign keys integrity at the database level
event.listen(engine, "connect", lambda c, _: c.execute("pragma foreign_keys=ON"))

# Avoid double echo
logging.getLogger("sqlalchemy.engine").propagate = False


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise


DBSession = Annotated[Session, Depends(get_db)]
