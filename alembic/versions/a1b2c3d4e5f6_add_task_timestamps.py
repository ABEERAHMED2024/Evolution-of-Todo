"""add task timestamps

Revision ID: a1b2c3d4e5f6
Revises: 4f4297accc30
Create Date: 2026-02-16 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '4f4297accc30'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add created_at and updated_at timestamp columns to tasks table.
    Migration is non-destructive and preserves existing data.
    """
    # Add created_at column with server default
    op.add_column('tasks', sa.Column(
        'created_at',
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        nullable=False
    ))
    
    # Add updated_at column with server default and onupdate
    op.add_column('tasks', sa.Column(
        'updated_at',
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        nullable=False
    ))


def downgrade() -> None:
    """
    Rollback: Remove timestamp columns.
    """
    op.drop_column('tasks', 'updated_at')
    op.drop_column('tasks', 'created_at')
