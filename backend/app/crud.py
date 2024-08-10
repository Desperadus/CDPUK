import uuid
from typing import Any

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import Item, ItemCreate, User, UserCreate, UserUpdate, Mentor, Questionnaire


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def create_item(*, session: Session, item_in: ItemCreate, owner_id: uuid.UUID) -> Item:
    db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item

def create_mentor(*, session: Session, mentee_id: uuid.UUID, mentor_id: uuid.UUID) -> Mentor:
    db_mentor = Mentor(mentee_id=mentee_id, mentor_id=mentor_id)
    session.add(db_mentor)
    session.commit()
    session.refresh(db_mentor)
    return db_mentor


def get_mentors_by_mentee(*, session: Session, mentee_id: uuid.UUID) -> list[Mentor]:
    statement = select(Mentor).where(Mentor.mentee_id == mentee_id)
    return session.exec(statement).all()


def create_questionnaire(*, session: Session, questionnaire_in: Questionnaire, user_id: uuid.UUID) -> Questionnaire:
    db_questionnaire = Questionnaire.model_validate(questionnaire_in, update={"user_id": user_id})
    session.add(db_questionnaire)
    session.commit()
    session.refresh(db_questionnaire)
    return db_questionnaire

def delete_questionnaire(*, session: Session, questionnaire_id: uuid.UUID) -> Questionnaire:
    statement = select(Questionnaire).where(Questionnaire.id == questionnaire_id)
    db_questionnaire = session.exec(statement).first()
    session.delete(db_questionnaire)
    session.commit()
    return db_questionnaire


def get_questionnaires_by_user(*, session: Session, user_id: uuid.UUID) -> list[Questionnaire]:
    statement = select(Questionnaire).where(Questionnaire.user_id == user_id)
    return session.exec(statement).all()


def get_questionnaires_by_mentor(*, session: Session, mentor_id: uuid.UUID) -> list[Questionnaire]:
    statement = select(Questionnaire).join(User).join(Mentor, User.id == Mentor.mentee_id).where(Mentor.mentor_id == mentor_id)
    return session.exec(statement).all()