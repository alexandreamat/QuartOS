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

from base64 import b64decode

from plaid.model.institution import Institution
from plaid.model.institutions_get_by_id_request import InstitutionsGetByIdRequest
from plaid.model.institutions_get_by_id_request_options import (
    InstitutionsGetByIdRequestOptions,
)
from plaid.model.institutions_get_by_id_response import InstitutionsGetByIdResponse

from app.plaid.common import client, country_codes
from app.schemas.institution import InstitutionPlaidIn


def fetch_institution(plaid_id: str) -> InstitutionPlaidIn:
    request = InstitutionsGetByIdRequest(
        institution_id=plaid_id,
        country_codes=country_codes,
        options=InstitutionsGetByIdRequestOptions(include_optional_metadata=True),
    )
    response: InstitutionsGetByIdResponse = client.institutions_get_by_id(request)
    institution: Institution = response.institution
    return InstitutionPlaidIn(
        name=institution.name,
        country_code=institution.country_codes[0].value,
        plaid_id=institution.institution_id,
        url=getattr(institution, "url", None),
        logo=b64decode(institution.logo) if hasattr(institution, "logo") else None,
        colour=getattr(institution, "primary_color", None),
        plaid_metadata=institution.to_str(),
    )
