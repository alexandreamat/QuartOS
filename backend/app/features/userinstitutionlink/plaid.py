from typing import TYPE_CHECKING

from plaid.model.item import Item
from plaid.model.item_get_request import ItemGetRequest
from plaid.model.item_get_response import ItemGetResponse

from app.features.plaid.client import client

from app.features import institution

from .models import UserInstitutionLinkPlaidIn

if TYPE_CHECKING:
    from app.features.user.models import UserApiOut


def get_user_institution_link(
    access_token: str,
    current_user: "UserApiOut",
    institution: institution.models.InstitutionPlaidOut,
) -> UserInstitutionLinkPlaidIn:
    request = ItemGetRequest(access_token=access_token)
    response: ItemGetResponse = client.item_get(request)
    item: Item = response.item
    user_institution_link_in = UserInstitutionLinkPlaidIn(
        plaid_id=item.item_id,
        institution_id=institution.id,
        user_id=current_user.id,
        access_token=access_token,
        plaid_metadata=item.to_str(),
    )
    return user_institution_link_in
