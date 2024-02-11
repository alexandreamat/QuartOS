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
import logging
import re
from typing import TypeVar, Annotated

import pycountry
from pydantic import AfterValidator, BaseModel, ConfigDict

SchemaType = TypeVar("SchemaType", bound=BaseModel)

logger = logging.getLogger(__name__)


class ApiInMixin(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ApiOutMixin(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int


class PlaidInMixin(ApiInMixin):
    plaid_id: str
    plaid_metadata: str


class PlaidOutMixin(PlaidInMixin, ApiOutMixin): ...


class SyncableApiOutMixin(ApiOutMixin):
    plaid_id: str | None
    plaid_metadata: str | None
    is_synced: bool


def validate_currency_code(v: str) -> str:
    if v not in [currency.alpha_3 for currency in pycountry.currencies]:
        raise ValueError("Invalid currency code")
    return v


CurrencyCode = Annotated[str, AfterValidator(validate_currency_code)]


def validate_code_snippet(v: str) -> str:
    exec(f"def deserialize_field(row): return {v}")
    return v


CodeSnippet = Annotated[str, AfterValidator(validate_code_snippet)]


def validate_regex_pattern(v: str) -> str:
    re.compile(v)
    return v


RegexPattern = Annotated[str, AfterValidator(validate_regex_pattern)]


def validate_country_code(v: str) -> str:
    if v not in [country.alpha_2 for country in pycountry.countries]:
        raise ValueError("Invalid country code")
    return v


CountryCode = Annotated[str, AfterValidator(validate_country_code)]
