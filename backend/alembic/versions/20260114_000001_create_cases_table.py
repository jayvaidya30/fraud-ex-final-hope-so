"""create cases table

Revision ID: 20260114_000001
Revises:
Create Date: 2026-01-14
"""

from alembic import op
import sqlalchemy as sa


revision = "20260114_000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "cases",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("case_id", sa.String(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.String(),
            nullable=False,
            server_default=sa.text("'created'"),
        ),
        sa.Column("risk_score", sa.Integer(), nullable=True),
        sa.Column("signals", sa.JSON(), nullable=True),
        sa.Column("explanation", sa.String(), nullable=True),
    )
    op.create_index("ix_cases_id", "cases", ["id"], unique=False)
    op.create_index("ix_cases_case_id", "cases", ["case_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_cases_case_id", table_name="cases")
    op.drop_index("ix_cases_id", table_name="cases")
    op.drop_table("cases")
