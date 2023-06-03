import csv
import re
from decimal import Decimal
from datetime import datetime

from typing import Iterable

from .models import TransactionApiIn

deserializer_templates = {
    "amount": 'Decimal(row[8].replace(",", "") or 0) - Decimal(row[9].replace(",", "") or 0)',
    "datetime": 'datetime.strptime(row[0], "%Y-%m-%d")',
    "name": 'f"{row[1]}: {row[2]}"',
    "currency_code": '{"人民币": "CNY"}[row[10]]',
    "payment_channel": '{"消费": "in store", "退货": "in store", "支付宝提现": "online", "金融付款": "online", "退款": "in store"}.get(row[1], "other")',
    "code": '{"消费": "purchase", "退货": "adjustment", "利息": "interest", "转账": "transfer", "跨境费": "bank charge", "费": "bank charge", "ATM取款": "atm", "支付宝提现": "cash", "金融付款": "bill payment", "异地费": "bank charge", "反费": "adjustment", "取消费": "bank charge", "账务调整": "adjustment", "退款": "adjustment"}.get(row[1], "null")',
}

skip_lines = 7
columns_length = 14


def sanitise_row(row: list[str]) -> None:
    for i in range(len(row)):
        row[i] = re.sub(r"[\s\t]+", " ", row[i]).strip()


def create_instances_from_csv(
    file: Iterable[str], account_id: int
) -> list[TransactionApiIn]:
    instances = []
    deserializers = {}
    for field, code in deserializer_templates.items():
        exec(f"def deserialize_{field}(row): return {code}")
        deserializers[field] = locals()[f"deserialize_{field}"]
    reader = csv.reader(file)
    for _ in range(skip_lines):
        next(reader)
    for row in reader:
        if len(row) != columns_length:
            break
        sanitise_row(row)
        deserialized_row = {
            field: deserializer(row) for field, deserializer in deserializers.items()
        }
        deserialized_row["account_id"] = account_id
        instance = TransactionApiIn(**deserialized_row)
        instances.append(instance)
    return instances
