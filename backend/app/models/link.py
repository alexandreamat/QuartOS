from sqlalchemy import Column, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship

from app.db.base_class import Base

links = Table(
    "user_institution_association",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("user.id")),
    Column("institution_id", Integer, ForeignKey("institution.id")),
)
