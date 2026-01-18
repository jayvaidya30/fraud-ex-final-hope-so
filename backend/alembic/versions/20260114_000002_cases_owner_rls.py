"""cases owner_id + RLS

Revision ID: 20260114_000002
Revises: 20260114_000001
Create Date: 2026-01-14
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260114_000002"
down_revision = "20260114_000001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "cases",
        sa.Column(
            "owner_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
            server_default=sa.text("auth.uid()"),
        ),
    )
    op.create_index("ix_cases_owner_id", "cases", ["owner_id"], unique=False)

    op.execute("ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;")

    op.execute(
        """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cases' AND policyname = 'cases_select_own'
          ) THEN
            CREATE POLICY cases_select_own ON public.cases
              FOR SELECT
              USING (owner_id = auth.uid());
          END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cases' AND policyname = 'cases_insert_own'
          ) THEN
            CREATE POLICY cases_insert_own ON public.cases
              FOR INSERT
              WITH CHECK (owner_id = auth.uid());
          END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cases' AND policyname = 'cases_update_own'
          ) THEN
            CREATE POLICY cases_update_own ON public.cases
              FOR UPDATE
              USING (owner_id = auth.uid())
              WITH CHECK (owner_id = auth.uid());
          END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cases' AND policyname = 'cases_delete_own'
          ) THEN
            CREATE POLICY cases_delete_own ON public.cases
              FOR DELETE
              USING (owner_id = auth.uid());
          END IF;
        END $$;
        """
    )

    op.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO authenticated;")
    op.execute("GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;")


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS cases_delete_own ON public.cases;")
    op.execute("DROP POLICY IF EXISTS cases_update_own ON public.cases;")
    op.execute("DROP POLICY IF EXISTS cases_insert_own ON public.cases;")
    op.execute("DROP POLICY IF EXISTS cases_select_own ON public.cases;")

    op.drop_index("ix_cases_owner_id", table_name="cases")
    op.drop_column("cases", "owner_id")
