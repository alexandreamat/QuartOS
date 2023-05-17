from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship, Mapped

from app.db.base_class import Base

if TYPE_CHECKING:
    from .institution import Institution  # noqa: F401


class User(Base):
    id: int = Column(Integer, primary_key=True, index=True)
    full_name: str | None = Column(String, index=True)
    email: str = Column(String, unique=True, index=True, nullable=False)
    hashed_password: str = Column(String, nullable=False)
    is_superuser: bool = Column(Boolean(), default=False)
    institutions: Mapped["Institution"] = relationship(
        "Institution", back_populates="user"
    )
