// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { TransactionApiIn, TransactionApiOut } from "app/services/api";
import { TransactionApiInForm } from "./types";

export function transactionApiOutToForm(
  transaction: TransactionApiOut,
  form: TransactionApiInForm,
) {
  form.amount.set(transaction.amount);
  form.timestamp.set(transaction.timestamp || new Date());
  form.name.set(transaction.name);
  form.accountId.set(transaction.account_id);
}

export function transactionFormToApiIn(
  form: TransactionApiInForm,
): TransactionApiIn {
  return {
    amount: form.amount.value!,
    timestamp: form.timestamp.value!,
    name: form.name.value!,
    category_id: form.categoryId.value!,
    bucket_id: form.bucketId.value!,
  };
}
