from sqlalchemy import Column, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship

from app.models.base import Base

user_institution_links = Table(
    "user_institution_link",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("user.id")),
    Column("institution_id", Integer, ForeignKey("institution.id")),
)
