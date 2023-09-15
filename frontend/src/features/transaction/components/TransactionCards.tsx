import {
  ReadManyApiUsersMeTransactionsGetApiArg,
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

  const params: ReadManyApiUsersMeTransactionsGetApiArg = {
    timestampGe: timestampGe && formatDateParam(timestampGe),
    timestampLe: timestampLe && formatDateParam(timestampLe),
    search,
    isDescending,
    amountGe,
    amountLe,
    isAmountAbs,
    accountId,
  };

  const Item = ({
    response: t,
    loading,
  }: PaginatedItemProps<TransactionApiOut>) => (
    <TransactionCard
      key={t?.id}
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
        endpoint={api.endpoints.readManyApiUsersMeTransactionsGet}
        params={params}
        item={Item}
      />
    </Card.Group>
  );
}
