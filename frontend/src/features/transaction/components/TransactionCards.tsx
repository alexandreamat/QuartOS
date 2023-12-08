// Copyright (C) 2023 Alexandre Amat
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

import {
  ReadManyUsersMeTransactionsGetApiArg,
  TransactionApiOut,
  api,
} from "app/services/api";
import { TransactionsBarState } from "./Bar";
import { TransactionCard } from "./TransactionCard";
import { formatDateParam } from "utils/time";
import { Checkboxes } from "hooks/useCheckboxes";
import { InfiniteScroll } from "../../../components/InfiniteScroll";
import { MutableRefObject } from "react";
import { Card } from "semantic-ui-react";
import { PaginatedItemProps } from "types";

export default function TransactionCards(props: {
  barState: TransactionsBarState;
  isMultipleChoice?: boolean;
  checkboxes: Checkboxes;
  reference: MutableRefObject<HTMLDivElement | null>;
}) {
  const [search] = props.barState.search;
  const [timestampGe] = props.barState.timestampGe;
  const [timestampLe] = props.barState.timestampLe;
  const [isDescending] = props.barState.isDescending;
  const [amountGe] = props.barState.amountGe;
  const [amountLe] = props.barState.amountLe;
  const [isAmountAbs] = props.barState.isAmountAbs;
  const [accountId] = props.barState.accountId;

  const params: ReadManyUsersMeTransactionsGetApiArg = {
    timestampGe: timestampGe && formatDateParam(timestampGe),
    timestampLe: timestampLe && formatDateParam(timestampLe),
    search,
    isDescending,
    amountGe,
    amountLe,
    isAmountAbs,
    accountId,
  };

  const CardRenderer = ({
    response: t,
    loading,
  }: PaginatedItemProps<TransactionApiOut>) => (
    <TransactionCard
      transaction={t}
      checked={t && props.checkboxes.checked.has(t.id)}
      onCheckedChange={
        props.isMultipleChoice && t
          ? (x) => props.checkboxes.onChange(t.id, x)
          : undefined
      }
      loading={loading}
    />
  );

  return (
    <Card.Group style={{ margin: 0, overflow: "hidden" }}>
      <InfiniteScroll
        reference={props.reference}
        endpoint={api.endpoints.readManyUsersMeTransactionsGet}
        params={params}
        itemRenderer={CardRenderer}
      />
    </Card.Group>
  );
}
