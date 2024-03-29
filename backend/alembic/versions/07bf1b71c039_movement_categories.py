"""movement categories

Revision ID: 07bf1b71c039
Revises: 95912a207472
Create Date: 2024-01-20 18:13:37.389735

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "07bf1b71c039"
down_revision: Union[str, None] = "95912a207472"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("movement", sa.Column("category_id", sa.Integer(), nullable=True))
    op.create_foreign_key(None, "movement", "category", ["category_id"], ["id"])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, "movement", type_="foreignkey")
    op.drop_column("movement", "category_id")
    # ### end Alembic commands ###
