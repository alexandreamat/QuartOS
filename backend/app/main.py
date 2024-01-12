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

import json
import logging
import time
from typing import Any, Callable

from fastapi import FastAPI, Request

from app import initial_data
from app.settings import settings
from app.api import router

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s %(asctime)s - %(pathname)s:%(lineno)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    force=True,
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

initial_data.main()

app = FastAPI(title=settings.PROJECT_NAME, openapi_url="/openapi.json")

app.include_router(router)


@app.middleware("http")
async def add_process_time_header(
    request: Request, call_next: Callable[[Request], Any]
) -> Any:
    start_time = time.time()
    logger.debug("Calling %s %s...", request.method, request.url.path)
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.debug(
        "Called %s %s: %s (%.0f s).",
        request.method,
        request.url.path,
        response.status_code,
        process_time,
    )
    return response


with open("openapi.json", "w") as file:
    json.dump(app.openapi(), file, indent=2)
