import csv
import re

# imports for exec
import decimal
import datetime

from typing import Iterable, BinaryIO

from .models import TransactionApiIn

from app.features.transactiondeserialiser import TransactionDeserialiserApiOut


def __sanitise_row(row: list[str]) -> None:
    for i in range(len(row)):
        row[i] = re.sub(r"[\s\t]+", " ", row[i]).strip()


def get_transactions_from_csv(
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
