from base64 import b64decode

from plaid.model.institution import Institution
from plaid.model.institutions_get_by_id_request import InstitutionsGetByIdRequest
from plaid.model.institutions_get_by_id_request_options import (
    InstitutionsGetByIdRequestOptions,
)
from plaid.model.institutions_get_by_id_response import InstitutionsGetByIdResponse

from app.common.plaid import client, country_codes

from .models import InstitutionPlaidIn


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
