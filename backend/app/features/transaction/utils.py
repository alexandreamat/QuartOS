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
import datetime  # noqa

# imports for exec
import decimal  # noqa
import re
from typing import Iterable, BinaryIO

from app.features.transactiondeserialiser import TransactionDeserialiserApiOut
from .models import TransactionApiIn


def __sanitise_row(row: list[str]) -> None:
    for i in range(len(row)):
        row[i] = re.sub(r"[\s\t]+", " ", row[i]).strip()


def __get_transactions_from_csv(
    deserialiser_out: TransactionDeserialiserApiOut,
    file: BinaryIO,
    account_id: int,
) -> Iterable[TransactionApiIn]:
    deserializers = {}
    for field, value in vars(deserialiser_out).items():
        if "_deserialiser" not in field:
            continue
        field_name = field.replace("_deserialiser", "")
        function_name = f"deserialize_{field_name}"
        snippet = getattr(deserialiser_out, field)
        exec(f"def {function_name}(row): return {snippet}")
        deserializers[field_name] = locals()[function_name]
    text_file = file.read().decode(encoding=deserialiser_out.encoding).splitlines()
    reader = csv.reader(text_file, delimiter=deserialiser_out.delimiter)
    for _ in range(deserialiser_out.skip_rows):
        next(reader)
    for row in reader:
        if len(row) != deserialiser_out.columns:
            break
        __sanitise_row(row)
        deserialized_row = {
            field: deserializer(row) for field, deserializer in deserializers.items()
        }
        deserialized_row["account_id"] = account_id
        instance = TransactionApiIn(**deserialized_row)
        yield instance


def get_transactions_from_csv(
    deserialiser_out: TransactionDeserialiserApiOut, file: BinaryIO, account_id: int
) -> Iterable[TransactionApiIn]:
    ts = [t for t in __get_transactions_from_csv(deserialiser_out, file, account_id)]
    # Return first old and then recent
    if deserialiser_out.ascending_timestamp:
        # transactions in the CSV are sorted from old to recent (ascending), no need to reverse
        for t in ts:
            yield t
    else:
        # transactions in the CSV are sorted from recent to old (descending), need to reverse
        for t in ts[::-1]:
            yield t
