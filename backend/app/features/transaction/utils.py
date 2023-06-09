import csv
import re
from decimal import Decimal
from datetime import datetime

from typing import Iterable

from .models import TransactionApiIn

from app.features.transactiondeserialiser import TransactionDeserialiserApiOut  # type: ignore[attr-defined]


def __sanitise_row(row: list[str]) -> None:
    for i in range(len(row)):
        row[i] = re.sub(r"[\s\t]+", " ", row[i]).strip()


def get_transactions_from_csv(
    deserialiser: TransactionDeserialiserApiOut, file: Iterable[str], account_id: int
) -> Iterable[TransactionApiIn]:
    deserializers = {}
    for field, value in vars(deserialiser).items():
        if "_deserialiser" not in field:
            continue
        field_name = field.replace("_deserialiser", "")
        function_name = f"deserialize_{field_name}"
        snippet = getattr(deserialiser, field)
        exec(f"def {function_name}(row): return {snippet}")
        deserializers[field_name] = locals()[function_name]
    reader = csv.reader(file)
    for _ in range(deserialiser.skip_rows):
        next(reader)
    for row in reader:
        if len(row) != deserialiser.columns:
            break
        __sanitise_row(row)
        deserialized_row = {
            field: deserializer(row) for field, deserializer in deserializers.items()
        }
        deserialized_row["account_id"] = account_id
        instance = TransactionApiIn(**deserialized_row)
        yield instance
