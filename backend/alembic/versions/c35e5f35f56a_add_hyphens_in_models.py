"""add hyphens in models

Revision ID: c35e5f35f56a
Revises: 57e76c5fb22f
Create Date: 2024-03-04 05:05:12.255422

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c35e5f35f56a"
down_revision: Union[str, None] = "57e76c5fb22f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.rename_table("userinstitutionlink", "user_institution_link")
    op.rename_table("replacementpattern", "replacement_pattern")
    op.rename_table("transactiondeserialiser", "transaction_deserialiser")
    op.alter_column(
        "institution",
        "transactiondeserialiser_id",
        new_column_name="transaction_deserialiser_id",
    )
    op.alter_column(
        "institution", "replacementpattern_id", new_column_name="replacement_pattern_id"
    )
    op.alter_column(
        "account", "userinstitutionlink_id", new_column_name="user_institution_link_id"
    )


def downgrade() -> None:
    op.rename_table("user_institution_link", "userinstitutionlink")
    op.rename_table("replacement_pattern", "replacementpattern")
    op.rename_table("transaction_deserialiser", "transactiondeserialiser")
    op.alter_column(
        "institution",
        "transaction_deserialiser_id",
        new_column_name="transactiondeserialiser_id",
    )
    op.alter_column(
        "institution", "replacement_pattern_id", new_column_name="replacementpattern_id"
    )
    op.alter_column(
        "account", "user_institution_link_id", new_column_name="userinstitutionlink_id"
    )
