import uuid
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import col, delete, func, select

from app import crud
from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models import (
    Item,
    Message,
    UpdatePassword,
    User,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
    Mentor,
    Questionnaire,
    QuestionnaireCreate
)

router = APIRouter()

@router.post("/{mentor_email}", response_model=Mentor)
def assign_mentor(
    *,
    session: SessionDep,
    mentor_email: str,
    current_user: CurrentUser
) -> Any:
    """
    Assign a mentor to the current user by email.
    """
    potential_mentor = crud.get_user_by_email(session=session, email=mentor_email)
    if not potential_mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    mentor = session.query(Mentor).filter_by(mentee_id=current_user.id, mentor_id=potential_mentor.id).first()
    print(mentor)
    if mentor is not None:
        raise HTTPException(status_code=400, detail="Mentor already assigned")
    mentor = crud.get_user_by_email(session=session, email=mentor_email)
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    mentor = crud.create_mentor(session=session, mentee_id=current_user.id, mentor_id=mentor.id, mentor_email=mentor_email)
    return mentor

@router.delete("/{mentor_id}", response_model=Message)
def delete_mentor(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    mentor_id: uuid.UUID
) -> Any:
    """
    Delete a mentor from the current user.
    """
    mentor = session.query(Mentor).filter_by(mentee_id=current_user.id, mentor_id=mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    session.delete(mentor)
    session.commit()
    return Message(message="Mentor deleted successfully")

@router.get("/", response_model=List[Mentor])
def get_mentors(
    *,
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Retrieve mentors for the current user.
    """
    mentors = crud.get_mentors_by_mentee(session=session, mentee_id=current_user.id)
    return mentors