from datetime import datetime

from sqlmodel import SQLModel


# class LinkToken(SQLModel):
#     link_token: str
#     expiration: datetime
#     request_id: str


# class AccessToken(SQLModel):
#     access_token: str
#     item_id: str
#     request_id: str


# class Item(SQLModel):
#     item_id: str
#     webhook: str | None
#     # error: PlaidError
#     # available_products: list[Products]
#     # billed_products: list[Products]
#     consent_expiration_time: datetime | None
#     update_type: str
#     institution_id: str | None
#     # products: list[Products]
#     # consented_products: list[Products]
