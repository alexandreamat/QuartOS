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


from typing import Any, Literal
from pydantic import BaseModel, ConfigDict


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
