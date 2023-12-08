# Copyright (C) 2023 Alexandre Amat
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

from fastapi import FastAPI

from app import initial_data
from app.settings import settings
from app.api import router

initial_data.main()

app = FastAPI(title=settings.PROJECT_NAME, openapi_url="/openapi.json")

app.include_router(router)

with open("openapi.json", "w") as file:
    json.dump(app.openapi(), file, indent=2)
