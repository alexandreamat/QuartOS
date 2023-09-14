import { ReadManyApiUsersMeTransactionsGetApiArg, api } from "app/services/api";
import { useRef } from "react";
import { BarState } from "./Bar";
import { useInfiniteQuery } from "hooks/useInfiniteQuery";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { TransactionCard } from "./TransactionCard";
import { Card } from "semantic-ui-react";
import { formatDateParam } from "utils/time";
import ExhaustedDataCard from "components/ExhaustedDataCard";
import { Checkboxes } from "hooks/useCheckboxes";
import FlexColumn from "components/FlexColumn";

const PER_PAGE = 20;

export default function TransactionCards(props: {
  barState: BarState;
  isMultipleChoice?: boolean;
  checkboxes: Checkboxes;
}) {
  const reference = useRef<HTMLDivElement | null>(null);

  const [search] = props.barState.search;
  const [timestampGe] = props.barState.timestampGe;
  const [timestampLe] = props.barState.timestampLe;
  const [isDescending] = props.barState.isDescending;
  const [amountGe] = props.barState.amountGe;
  const [amountLe] = props.barState.amountLe;
  const [isAmountAbs] = props.barState.isAmountAbs;
  const [accountId] = props.barState.accountId;

  const queryArg: ReadManyApiUsersMeTransactionsGetApiArg = {
    timestampGe: timestampGe && formatDateParam(timestampGe),
    timestampLe: timestampLe && formatDateParam(timestampLe),
    search,
    isDescending,
    amountGe,
    amountLe,
    isAmountAbs,
    accountId,
  };

  const infiniteQuery = useInfiniteQuery(
    api.endpoints.readManyApiUsersMeTransactionsGet,
    queryArg,
    PER_PAGE,
    reference,
  );

  return (
    <FlexColumn.Auto reference={reference}>
      <Card.Group style={{ margin: 0, overflow: "hidden" }}>
        {infiniteQuery.isError && <QueryErrorMessage query={infiniteQuery} />}
        {infiniteQuery.data.map((t, i) => (
          <TransactionCard
            key={i}
            transaction={t}
            checked={props.checkboxes.checked.has(t.id)}
            onCheckedChange={
              props.isMultipleChoice
                ? (x) => props.checkboxes.onChange(t.id, x)
                : undefined
            }
          />
        ))}
        {infiniteQuery.isFetching && <TransactionCard loading />}
        {infiniteQuery.isExhausted && <ExhaustedDataCard />}
      </Card.Group>
    </FlexColumn.Auto>
  );
}
