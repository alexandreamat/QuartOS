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
# along with this program.  If not, see <https://www.gnu.org/licenses/>.


from functools import wraps
from logging import getLogger
from typing import Any, Callable, TypeVar

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from app.crud.replacementpattern import CRUDReplacementPattern
from app.crud.user import CRUDUser
from app.crud.userinstitutionlink import CRUDSyncableUserInstitutionLink
from app.database.deps import get_db
from app.plaid.userinstitutionlink import sync_transactions
from app.schemas.webhook import (
    ItemErrorWebhookReq,
    SyncUpdatesAvailableWebhookReq,
    WebhookUpdateAcknowledgedWebhookReq,
)


F = TypeVar("F", bound=Callable[..., Any])

logger = getLogger(__name__)


def handle_exceptions(handler: F) -> F:
    @wraps(handler)
    def wrapper(*args, **kwargs):
        try:
            logger.info("Doing job %s, %s.", args, kwargs)
            for db in get_db():
                return handler(*args, db=db, **kwargs)
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
            db, user_institution_link_id=user_institution_link_out.id
        )
    except HTTPException:  # FIXME: should not throw http exceptions
        replacement_pattern_out = None
    sync_transactions(
        db,
        user_institution_link_out=user_institution_link_out,
        replacement_pattern_out=replacement_pattern_out,
        default_currency_code=user_out.default_currency_code,
    )


@handle_exceptions
def handle_item_webhook_update_acknowledged(
    req: WebhookUpdateAcknowledgedWebhookReq, db: Session
) -> None:
    logger.info("New URL: %s, Error: %s", req.new_webhook_url, req.error)


@handle_exceptions
def handle_item_error(req: ItemErrorWebhookReq, db: Session) -> None:
    logger.error("Plaid reported error %s", req.error)


@handle_exceptions
def handle_transactions_default_update(req: Any, db: Session) -> None: ...
