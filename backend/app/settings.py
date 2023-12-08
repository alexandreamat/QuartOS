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

import secrets

from pydantic import BaseSettings, EmailStr, Field, PostgresDsn


class Settings(BaseSettings):
    JWT_SECRET_KEY: str = secrets.token_urlsafe(32)

    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    PROJECT_NAME: str = "QuartOS"

    DATABASE_URL: PostgresDsn = Field(default=...)

    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48
    FIRST_SUPERUSER: EmailStr = Field(default=...)
    FIRST_SUPERUSER_PASSWORD: str = Field(default=...)
    FIRST_SUPERUSER_FULL_NAME: str = Field(default=...)

    class Config:
        case_sensitive = True


settings = Settings()
