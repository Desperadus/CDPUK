import uuid
from typing import Any

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
from app.utils import generate_new_account_email, send_email

router = APIRouter()

@router.post("/", response_model=Questionnaire)
def create_questionnaire_for_user(
    *,
    session: SessionDep,
    questionnaire_in: QuestionnaireCreate,
    current_user: CurrentUser
) -> Any:
    """
    Create a new questionnaire for the current user.
    """
    questionnaire = crud.create_questionnaire(session=session, questionnaire_in=questionnaire_in, user_id=current_user.id)
    return questionnaire

@router.delete("/{questionnaire_id}", response_model=Message)
def delete_questionnaire_for_user(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    questionnaire_id: uuid.UUID
) -> Any:
    """
    Delete a questionnaire for the current user.
    """
    questionnaire = session.get(Questionnaire, questionnaire_id)
    if not questionnaire:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    if questionnaire.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    session.delete(questionnaire)
    session.commit()
    return Message(message="Questionnaire deleted successfully")

@router.get("/", response_model=list[Questionnaire])
def get_questionnaires_for_user(
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Get questionnaires for the current user.
    """
    questionnaires = crud.get_questionnaires_by_user(session=session, user_id=current_user.id)
    return questionnaires

@router.get("/{user_id}/questionnaires", response_model=list[Questionnaire])
def get_questionnaires_for_user_by_id(
    user_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Get questionnaires for a specific user by id.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if current_user.is_superuser or current_user.id == user_id:
        questionnaires = crud.get_questionnaires_by_user(session=session, user_id=user_id)
        return questionnaires

    # Check if current user is a mentor for the user
    mentors = crud.get_mentors_by_mentee(session=session, mentee_id=user_id)
    for mentor in mentors:
        if mentor.mentor_id == current_user.id:
            questionnaires = crud.get_questionnaires_by_user(session=session, user_id=user_id)
            return questionnaires

    raise HTTPException(status_code=403, detail="Not enough permissions")