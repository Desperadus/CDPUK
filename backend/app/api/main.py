from fastapi import APIRouter

from app.api.routes import items, login, users, utils, questionnaires, mentors

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(questionnaires.router, prefix="/questionnaires", tags=["questionnaires"])
api_router.include_router(mentors.router, prefix="/mentors", tags=["mentors"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])