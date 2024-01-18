"""add default currency amount

Revision ID: 2a70a877500c
Revises: 8fc646f6d688
Create Date: 2024-01-18 03:47:32.144897

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "2a70a877500c"
down_revision: Union[str, None] = "8fc646f6d688"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "transaction",
        sa.Column(
            "amount_default_currency", sa.Numeric(), nullable=False, server_default="0"
        ),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("transaction", "amount_default_currency")
    # ### end Alembic commands ###
