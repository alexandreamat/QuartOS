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

from fastapi.testclient import TestClient
from sqlmodel import Session

from app._test import client, db
from app.features.user import UserApiIn, CRUDUser


def test_login(client: TestClient, db: Session) -> None:
    CRUDUser.create(
        db,
        UserApiIn(
            email="test@example.com",
            password="supersecretpassword",
            full_name="Test User",
            is_superuser=False,
        ),
    )

    response = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "supersecretpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["access_token"]
    assert data["token_type"] == "bearer"
