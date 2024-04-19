"""polymorphic user

Revision ID: c0136e598ab2
Revises: de8cc3124da5
Create Date: 2024-04-19 00:33:05.457258

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c0136e598ab2"
down_revision: Union[str, None] = "de8cc3124da5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "user",
        sa.Column("type", sa.String(), nullable=False, server_default="defaultuser"),
    )
    op.add_column("user", sa.Column("client_host", sa.String(), nullable=True))
    op.drop_column("user", "is_superuser")


def downgrade() -> None:
    op.add_column(
        "user",
        sa.Column("is_superuser", sa.BOOLEAN(), autoincrement=False, nullable=False),
    )
    op.drop_column("user", "client_host")
    op.drop_column("user", "type")
