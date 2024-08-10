import uuid
from datetime import datetime

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

from sqlalchemy.orm import relationship

from sqlalchemy import Index

# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner")

    # New relationships for mentors and questionnaires
    mentors_mentee: list["Mentor"] = Relationship(
        sa_relationship=relationship(
            "Mentor", back_populates="mentee", foreign_keys="Mentor.mentee_id"
        )
    )
    mentors_mentor: list["Mentor"] = Relationship(
        sa_relationship=relationship(
            "Mentor", back_populates="mentor", foreign_keys="Mentor.mentor_id"
        )
    )
    questionnaires: list["Questionnaire"] = Relationship(back_populates="user")


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    title: str = Field(min_length=1, max_length=255)


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255)
    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


# Mentor model
class Mentor(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    mentee_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    mentor_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    mentor_email: EmailStr | None = Field(default=None, max_length=255)

    mentee: User = Relationship(
        sa_relationship=relationship(
            "User", back_populates="mentors_mentee", foreign_keys="Mentor.mentee_id"
        )
    )
    mentor: User = Relationship(
        sa_relationship=relationship(
            "User", back_populates="mentors_mentor", foreign_keys="Mentor.mentor_id"
        )
    )

    __table_args__ = (
        Index('ix_mentee_id', 'mentee_id'),
        Index('ix_mentor_id', 'mentor_id'),
    )


# Questionnaire models
class QuestionnaireBase(SQLModel):
    question: str = Field(nullable=False)
    answer: bool | None = Field(default=None)
    written_answer: str | None = Field(default=None)
    notification_date: datetime | None = Field(default=None)


class QuestionnaireCreate(QuestionnaireBase):
    pass


class Questionnaire(QuestionnaireBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)

    user: User = Relationship(back_populates="questionnaires")
