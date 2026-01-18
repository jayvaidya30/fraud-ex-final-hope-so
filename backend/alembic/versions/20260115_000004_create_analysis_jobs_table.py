"""create analysis_jobs table

Revision ID: 20260115_000004
Revises: 20260114_000003
Create Date: 2026-01-15
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260115_000004"
down_revision = "20260114_000003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "analysis_jobs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("job_id", sa.String(), nullable=False),
        sa.Column("case_id", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default=sa.text("'queued'")),
        sa.Column("error", sa.String(), nullable=True),
        sa.Column(
            "queued_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "owner_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
            server_default=sa.text("auth.uid()"),
        ),
    )
    op.create_index("ix_analysis_jobs_id", "analysis_jobs", ["id"], unique=False)
    op.create_index("ix_analysis_jobs_job_id", "analysis_jobs", ["job_id"], unique=True)
    op.create_index("ix_analysis_jobs_case_id", "analysis_jobs", ["case_id"], unique=False)
    op.create_index("ix_analysis_jobs_owner_id", "analysis_jobs", ["owner_id"], unique=False)

    op.execute("ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;")

    op.execute(
        """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analysis_jobs' AND policyname = 'analysis_jobs_select_own'
          ) THEN
            CREATE POLICY analysis_jobs_select_own ON public.analysis_jobs
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
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analysis_jobs' AND policyname = 'analysis_jobs_insert_own'
          ) THEN
            CREATE POLICY analysis_jobs_insert_own ON public.analysis_jobs
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
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analysis_jobs' AND policyname = 'analysis_jobs_update_own'
          ) THEN
            CREATE POLICY analysis_jobs_update_own ON public.analysis_jobs
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
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analysis_jobs' AND policyname = 'analysis_jobs_delete_own'
          ) THEN
            CREATE POLICY analysis_jobs_delete_own ON public.analysis_jobs
              FOR DELETE
              USING (owner_id = auth.uid());
          END IF;
        END $$;
        """
    )

    op.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON public.analysis_jobs TO authenticated;")
    op.execute("GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;")


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS analysis_jobs_delete_own ON public.analysis_jobs;")
    op.execute("DROP POLICY IF EXISTS analysis_jobs_update_own ON public.analysis_jobs;")
    op.execute("DROP POLICY IF EXISTS analysis_jobs_insert_own ON public.analysis_jobs;")
    op.execute("DROP POLICY IF EXISTS analysis_jobs_select_own ON public.analysis_jobs;")

    op.drop_index("ix_analysis_jobs_owner_id", table_name="analysis_jobs")
    op.drop_index("ix_analysis_jobs_case_id", table_name="analysis_jobs")
    op.drop_index("ix_analysis_jobs_job_id", table_name="analysis_jobs")
    op.drop_index("ix_analysis_jobs_id", table_name="analysis_jobs")
    op.drop_table("analysis_jobs")
