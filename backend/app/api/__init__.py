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

from logging import getLogger
from fastapi import APIRouter
from fastapi import BackgroundTasks
from app.database.deps import DBSession
from app import handlers
from app.schemas.webhook import WebhookReq
from app.utils import include_package_routes

router = APIRouter()

logger = getLogger(__name__)


@router.post("/webhook")
def webhook(req: WebhookReq, background_tasks: BackgroundTasks, db: DBSession) -> None:
    name = f"handle_{req.webhook_type.lower()}_{req.webhook_code.lower()}"
    try:
        handler = getattr(handlers, name)
    except AttributeError:
        logger.error(
            "%s/%s currently not supported", req.webhook_type, req.webhook_code
        )
        return
    background_tasks.add_task(handler, req, db)


include_package_routes(router, __name__, __path__)
