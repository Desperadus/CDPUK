"""Save mentors email

Revision ID: 161af7bd6a61
Revises: 50955621ab3c
Create Date: 2024-08-10 18:27:02.343554

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '161af7bd6a61'
down_revision = '50955621ab3c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('mentor', sa.Column('mentor_email', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True))
    op.create_index('ix_mentee_id', 'mentor', ['mentee_id'], unique=False)
    op.create_index('ix_mentor_id', 'mentor', ['mentor_id'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_mentor_id', table_name='mentor')
    op.drop_index('ix_mentee_id', table_name='mentor')
    op.drop_column('mentor', 'mentor_email')
    # ### end Alembic commands ###
