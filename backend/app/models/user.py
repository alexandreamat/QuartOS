from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship, Mapped


from app.db.base_class import Base

from .link import links

if TYPE_CHECKING:
    from .institution import Institution  # noqa: F401


class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_superuser = Column(Boolean(), default=False)
    institutions: Mapped[list["Institution"]] = relationship(
        "Institution", secondary=links
    )
