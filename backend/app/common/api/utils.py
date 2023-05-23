from fastapi import APIRouter
from pydantic.networks import EmailStr

from app.core.celery_app import celery_app
from app.utils import send_test_email

from app.features.user import deps

router = APIRouter()


@router.post("/test-celery/", status_code=201)
def test_celery(msg: str, current_user: deps.CurrentUser) -> str:
    """
    Test Celery worker.
    """
    celery_app.send_task("app.worker.test_celery", args=[msg])
    return "Word received"


@router.post("/test-email/", status_code=201)
def test_email(email_to: EmailStr, current_user: deps.CurrentUser) -> str:
    """
    Test emails.
    """
    send_test_email(email_to=email_to)
    return "Test email sent"
