import { api } from "app/services/api";
import { useEffect, useRef, useState } from "react";
import Bar from "./components/Bar";
import FlexColumn from "components/FlexColumn";
import { logMutationError } from "utils/error";
import SpanButton from "./components/SpanButton";
import { useTransactionBarState } from "./components/Bar";
import { useCheckboxes } from "hooks/useCheckboxes";
import { useLocation } from "react-router-dom";
import TransactionCards from "./components/TransactionCards";

export const PER_PAGE = 20;

export default function Transactions() {
  const location = useLocation();
  const reference = useRef<HTMLDivElement | null>(null);
  const isMultipleChoiceState = useState(false);
  const [isMultipleChoice, setIsMultipleChoice] = isMultipleChoiceState;

  const barState = useTransactionBarState();
  const [_, setAccountId] = barState.accountId;

  const checkboxes = useCheckboxes();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accountIdParam = Number(params.get("accountId")) || undefined;
    if (accountIdParam) setAccountId(accountIdParam);
  }, [location, setAccountId]);

  const [createMovement, createMovementResult] =
    api.endpoints.createApiUsersMeMovementsPost.useMutation();

  async function handleMergeTransactions() {
    try {
      await createMovement([...checkboxes.checked]).unwrap();
    } catch (error) {
      logMutationError(error, createMovementResult);
      return;
    }
    setIsMultipleChoice(false);
    checkboxes.reset();
  }

  return (
    <FlexColumn style={{ height: "100%" }}>
      <Bar barState={barState} isMultipleChoiceState={isMultipleChoiceState} />
      <FlexColumn.Auto reference={reference}>
        <TransactionCards
          reference={reference}
          barState={barState}
          checkboxes={checkboxes}
          isMultipleChoice={isMultipleChoice}
        />
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
