import { ReadManyApiUsersMeTransactionsGetApiArg, api } from "app/services/api";
import { useEffect, useRef, useState } from "react";
import Bar from "./Bar";
import FlexColumn from "components/FlexColumn";
import { useInfiniteQuery } from "hooks/useInfiniteQuery";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { TransactionCard } from "./TransactionCard";
import { Card } from "semantic-ui-react";
import { formatDateParam } from "utils/time";
import ExhaustedDataCard from "components/ExhaustedDataCard";
import { logMutationError } from "utils/error";
import SpanButton from "./SpanButton";
import { useTransactionBarState } from "./Bar";

const PER_PAGE = 20;

export function useCheckboxes() {
  const [checked, setChecked] = useState(new Set<number>());

  function handleCheckboxChange(id: number, checked: boolean) {
    setChecked((x) => {
      if (checked) x.add(id);
      else x.delete(id);
      return new Set(x);
    });
  }

  function reset() {
    setChecked(new Set());
  }

  return { checked, onCheckboxChange: handleCheckboxChange, reset };
}

export function Lala() {}

export default function TransactionCards(props: { accountId?: number }) {
  const barState = useTransactionBarState(props.accountId);

  const [accountId, setAccountId] = barState.accountId;
  const [search] = barState.search;
  const [timestampGe] = barState.timestampGe;
  const [timestampLe] = barState.timestampLe;
  const [isDescending] = barState.isDescending;
  const [amountGe] = barState.amountGe;
  const [amountLe] = barState.amountLe;
  const [isAmountAbs] = barState.isAmountAbs;
  const [isMultipleChoice, setIsMultipleChoice] = barState.isMultipleChoice;

  const reference = useRef<HTMLDivElement | null>(null);

  const checkboxes = useCheckboxes();

  const [createMovement, createMovementResult] =
    api.endpoints.createApiUsersMeMovementsPost.useMutation();

  useEffect(() => {
    if (props.accountId) setAccountId(props.accountId);
  }, [props.accountId, setAccountId]);

  async function handleMergeTransactions() {
    try {
      await createMovement([...checkboxes.checked]).unwrap();
    } catch (error) {
      logMutationError(error, createMovementResult);
      return;
    }
    setIsMultipleChoice(false);
    checkboxes.reset();
    infiniteQuery.onMutation();
  }

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
    reference
  );

  return (
    <FlexColumn style={{ height: "100%" }}>
      <Bar barState={barState} />
      <FlexColumn.Auto reference={reference}>
        <>
          {infiniteQuery.isError && <QueryErrorMessage query={infiniteQuery} />}
          <Card.Group style={{ margin: 0, overflow: "hidden" }}>
            {infiniteQuery.data.map((t, i) => (
              <TransactionCard
                key={i}
                transaction={t}
                checked={checkboxes.checked.has(t.id)}
                onCheckedChange={
                  isMultipleChoice
                    ? (x) => checkboxes.onCheckboxChange(t.id, x)
                    : undefined
                }
              />
            ))}
            {infiniteQuery.isFetching && <TransactionCard loading />}
            {infiniteQuery.isExhausted && <ExhaustedDataCard />}
          </Card.Group>
        </>
      </FlexColumn.Auto>
      {isMultipleChoice && (
        <SpanButton
          disabled={checkboxes.checked.size <= 1}
          onClick={handleMergeTransactions}
          loading={createMovementResult.isLoading}
          negative={createMovementResult.isError}
        >
          {`Combine ${checkboxes.checked.size} transactions into one movement`}
        </SpanButton>
      )}
    </FlexColumn>
  );
}
