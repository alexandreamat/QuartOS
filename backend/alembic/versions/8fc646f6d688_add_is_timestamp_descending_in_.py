"""add is timestamp descending in deserialisers

Revision ID: 8fc646f6d688
Revises: 6dc8f33c0a7d
Create Date: 2024-01-18 00:50:25.667497

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "8fc646f6d688"
down_revision: Union[str, None] = "6dc8f33c0a7d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "transactiondeserialiser",
        sa.Column(
            "ascending_timestamp", sa.Boolean(), nullable=False, server_default="false"
        ),
    )


# ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("transactiondeserialiser", "ascending_timestamp")
    # ### end Alembic commands ###
