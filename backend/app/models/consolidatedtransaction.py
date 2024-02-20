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


from sqlalchemy import distinct, func
from app.models.account import Account
from app.models.common import CalculatedColumnsMeta

from app.models.movement import Movement
from app.models.transaction import Transaction


class ConsolidatedTransaction(metaclass=CalculatedColumnsMeta):
    id = func.coalesce(-Movement.id, Transaction.id)
    name = func.coalesce(Movement.name, Transaction.name)
    category_id = func.coalesce(Movement.category_id, Transaction.category_id)
    timestamp = func.min(Transaction.timestamp)
    amount_default_currency = func.sum(Transaction.amount_default_currency)
    transactions_count = func.count(Transaction.id)
    account_id_max = func.max(Transaction.account_id)
    account_id_min = func.min(Transaction.account_id)
    movement_id = Movement.id
    amount = func.sum(Transaction.amount)
    currency_codes = func.count(distinct(Account.currency_code))
