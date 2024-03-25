# Copyright (C) 2024 Alexandre Amat
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from functools import wraps
from logging import getLogger
from typing import Any, Callable, Literal, TypeVar
from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from app.crud.replacementpattern import CRUDReplacementPattern
from app.crud.user import CRUDUser
from app.crud.userinstitutionlink import CRUDSyncableUserInstitutionLink
from app.database.deps import DBSession
from app.plaid.userinstitutionlink import sync_transactions
from app.utils import include_package_routes

router = APIRouter()

logger = getLogger(__name__)


class Error(BaseModel):
    error_type: str
    error_code: str
    error_message: str
    display_message: str | None
    request_id: str
    causes: Any
    status: int | None
    documentation_url: str
    suggested_action: str | None

    def __repr__(self) -> str:
        return f"{self.error_type}/{self.error_code}: {self.display_message or self.error_message}. For more info see {self.documentation_url}"


class WebhookReqBase(BaseModel):
    webhook_type: str
    webhook_code: str
    item_id: str
    environment: Any


class ItemWebhooksReqBase(WebhookReqBase):
    webhook_type: Literal["ITEM"]


class WebhookUpdateAcknowledgedWebhookReq(ItemWebhooksReqBase):
    webhook_code: Literal["WEBHOOK_UPDATE_ACKNOWLEDGED"]
    new_webhook_url: str
    error: Error


class ItemErrorWebhookReq(ItemWebhooksReqBase):
    webhook_code: Literal["ERROR"]
    error: Error


class TransactionsWebhooksReqBase(WebhookReqBase):
    webhook_type: Literal["TRANSACTIONS"]


class SyncUpdatesAvailableWebhookReq(TransactionsWebhooksReqBase):
    webhook_code: Literal["SYNC_UPDATES_AVAILABLE"]
    initial_update_complete: bool
    historical_update_complete: bool


class OtherWebhookRew(WebhookReqBase):
    model_config = ConfigDict(extra="allow")


WebhookReq = (
    WebhookUpdateAcknowledgedWebhookReq
    | ItemErrorWebhookReq
    | SyncUpdatesAvailableWebhookReq
    | OtherWebhookRew
)

F = TypeVar("F", bound=Callable[..., Any])


def handle_exceptions(handler: F) -> F:
    @wraps(handler)
    def wrapper(*args, **kwargs):
        try:
            logger.info("Doing job %s, %s.", args, kwargs)
            return handler(*args, **kwargs)
        except NoResultFound as e:
            logger.error("An error occurred while processing webhook: %s", e)
        except Exception as e:
            logger.error("An unexpected error occurred while processing webhook: %s", e)

    return wrapper


@handle_exceptions
def handle_transactions_sync_updates_available(
    req: SyncUpdatesAvailableWebhookReq, db: Session
) -> None:
    logger.info(req.__class__)
    user_institution_link_out = CRUDSyncableUserInstitutionLink.read(
        db, plaid_id=req.item_id
    )
    user_out = CRUDUser.read(db, id=user_institution_link_out.user_id)
    try:
        replacement_pattern_out = CRUDReplacementPattern.read(
            db, institution_id=user_institution_link_out.institution_id
        )
    except NoResultFound:
        replacement_pattern_out = None
    sync_transactions(
        db,
        user_institution_link_out=user_institution_link_out,
        replacement_pattern_out=replacement_pattern_out,
        default_currency_code=user_out.default_currency_code,
    )


@handle_exceptions
def handle_webhook_update_acknowledged(
    req: WebhookUpdateAcknowledgedWebhookReq, db: Session
) -> None:
    logger.info("New URL: %s, Error: %s", req.new_webhook_url, req.error)


@handle_exceptions
def handle_item_error(req: ItemErrorWebhookReq, db: Session) -> None:
    logger.error("Plaid reported error %s", req.error)


HANDLERS: dict[str, dict[str, Callable[[Any, Session], None]]] = {
    "TRANSACTIONS": {
        "SYNC_UPDATES_AVAILABLE": handle_transactions_sync_updates_available
    },
    "ITEM": {
        "ERROR": handle_item_error,
        "WEBHOOK_UPDATE_ACKNOWLEDGED": handle_webhook_update_acknowledged,
    },
}


@router.post("/webhook")
def webhook(req: WebhookReq, background_tasks: BackgroundTasks, db: DBSession) -> None:
    try:
        handler = HANDLERS[req.webhook_type][req.webhook_code]
    except KeyError:
        logger.error(
            "%s/%s currently not supported", req.webhook_type, req.webhook_code
        )
        return
    background_tasks.add_task(handler, req, db)


include_package_routes(router, __name__, __path__)
