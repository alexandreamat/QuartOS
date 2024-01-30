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

import csv
from io import BytesIO

import requests
import sqlalchemy
from fastapi import HTTPException, status
from plaid.model.personal_finance_category import PersonalFinanceCategory
from requests import HTTPError
from requests_cache import CachedSession
from sqlmodel import Session

from app.features.category import CategoryPlaidIn
from app.features.category.crud import CRUDSyncableCategory


def create_category_plaid_in(
    personal_finance_category: PersonalFinanceCategory,
    personal_finance_category_icon_url: str,
) -> CategoryPlaidIn:
    plaid_id: str = personal_finance_category.primary
    category_name = plaid_id.replace("_", " ").capitalize()
    plaid_metadata = personal_finance_category.to_str()
    with CachedSession(expire_after=None) as session:
        response = session.get(personal_finance_category_icon_url)
    response.raise_for_status()
    icon = response.content
    return CategoryPlaidIn(
        name=category_name,
        icon=icon,
        plaid_id=plaid_id,
        plaid_metadata=plaid_metadata,
    )


def get_all_plaid_categories(db: Session) -> None:
    with requests.session() as session:
        response = session.get(
            "https://plaid.com/documents/transactions-personal-finance-category-taxonomy.csv"
        )
        try:
            response.raise_for_status()
        except HTTPError as e:
            raise HTTPException(status.HTTP_504_GATEWAY_TIMEOUT, detail=str(e))
        csv_file = BytesIO(response.content).read().decode().splitlines()
        rows = csv.reader(csv_file)
        next(rows)  # skip header
        for plaid_id in {row[0] for row in rows}:
            url = f"https://plaid-category-icons.plaid.com/PFC_{plaid_id}.png"
            response = session.get(url)
            try:
                response.raise_for_status()
            except HTTPError as e:
                raise HTTPException(status.HTTP_504_GATEWAY_TIMEOUT, detail=str(e))
            icon = response.content
            category_in = CategoryPlaidIn(
                name=plaid_id.replace("_", " ").capitalize(),
                icon=icon,
                plaid_id=plaid_id,
                plaid_metadata=plaid_id,
            )
            try:
                category_out = CRUDSyncableCategory.read_by_plaid_id(
                    db, category_in.plaid_id
                )
                CRUDSyncableCategory.update(db, category_out.id, category_in)
            except sqlalchemy.exc.NoResultFound:
                CRUDSyncableCategory.create(db, category_in)
