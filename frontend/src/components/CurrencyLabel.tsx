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

import { Label } from "semantic-ui-react";
import { FormattedCurrency } from "./FormattedCurrency";

export default function CurrencyLabel(props: {
  amount?: number;
  currencyCode?: string;
  loading?: boolean;
}) {
  return (
    <Label
      circular
      style={{ width: 100, textAlign: "center" }}
      color={
        props.amount && props.amount > 0
          ? "green"
          : props.amount && props.amount < 0
          ? "orange"
          : undefined
      }
    >
      {props.loading
        ? "..."
        : props.amount !== undefined &&
          props.currencyCode && (
            <FormattedCurrency
              amount={props.amount}
              currencyCode={props.currencyCode}
            />
          )}
    </Label>
  );
}
