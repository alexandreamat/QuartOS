import {
  ReadManyApiUsersMeTransactionsGetApiArg,
  TransactionApiOut,
  api,
} from "app/services/api";
import { useEffect, useState } from "react";
import Bar from "./Bar";
import FlexColumn from "components/FlexColumn";
import Form from "./Form";
import { useInfiniteQuery } from "hooks/useInfiniteQuery";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { TransactionCard } from "./TransactionCard";
import { Card } from "semantic-ui-react";
import { formatDateParam } from "utils/time";
import ExhaustedDataCard from "components/ExhaustedDataCard";
import MovementForm from "features/movements/components/Form";
import { logMutationError } from "utils/error";
import SpanButton from "./SpanButton";

const NOT_FOUND = -1;
const PER_PAGE = 20;

export default function TransactionCards(
  props:
    | {
        // from movement form
        onFlowCheckboxChange: (t: TransactionApiOut, x: boolean) => void;
        checked: Set<number>;
      }
    | {
        // from index
        accountId?: number;
      }
) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [selectedTransaction, setSelectedTransaction] = useState<
    TransactionApiOut | undefined
  >(undefined);

  const accountIdState = useState<number | undefined>(
    "accountId" in props ? props.accountId : undefined
  );
  const searchState = useState<string>();
  const timestampGeState = useState<Date>();
  const timestampLeState = useState<Date>();
  const isDescendingState = useState(true);
  const amountGeState = useState<number>();
  const amountLeState = useState<number>();
  const isAmountAbsState = useState(false);
  const isMultipleChoiceState = useState(false);

  const [accountId, setAccountId] = accountIdState;
  const [search] = searchState;
  const [timestampGe] = timestampGeState;
  const [timestampLe] = timestampLeState;
  const [isDescending] = isDescendingState;
  const [amountGe] = amountGeState;
  const [amountLe] = amountLeState;
  const [isAmountAbs] = isAmountAbsState;
  const [isMultipleChoice, setIsMultipleChoice] = isMultipleChoiceState;

  const [isEditMovementFormOpen, setIsEditMovementFormOpen] = useState(false);
  const [movementId, setMovementId] = useState<number | undefined>(undefined);

  const [checkedTransactions, setCheckedTransactions] = useState(
    new Set<number>()
  );

  const [createMovement, createMovementResult] =
    api.endpoints.createApiUsersMeMovementsPost.useMutation();

  useEffect(() => {
    if ("accountId" in props && props.accountId) setAccountId(props.accountId);
  }, [props]);

  function handleTransactionCheckboxChange(
    transaction: TransactionApiOut,
    checked: boolean
  ) {
    setCheckedTransactions((x) => {
      if (checked) {
        x.add(transaction.id);
      } else {
        x.delete(transaction.id);
      }
      return new Set(x);
    });
  }

  async function handleMergeTransactions() {
    try {
      await createMovement([...checkedTransactions]).unwrap();
    } catch (error) {
      logMutationError(error, createMovementResult);
      return;
    }
    setIsMultipleChoice(false);
    setCheckedTransactions(new Set());
    infiniteQuery.onMutation();
  }

  function handleOpenEditMovementForm(transaction: TransactionApiOut) {
    setMovementId(transaction.movement_id);
    setIsEditMovementFormOpen(true);
  }

  function handleCloseEditMovementForm() {
    setIsEditMovementFormOpen(false);
    setMovementId(undefined);
  }

  function handleGoToRelativeMovement(x: number) {
    setMovementId(infiniteQuery.data[movementIdx + x].movement_id);
  }

  const handleOpenEditForm = (transaction: TransactionApiOut) => {
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedTransaction(undefined);
    setIsFormOpen(false);
  };

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
    PER_PAGE
  );

  const movementIdx = infiniteQuery.data.findIndex(
    (t) => t.movement_id === movementId
  );

  return (
    <FlexColumn style={{ height: "100%" }}>
      {selectedTransaction && (
        <Form.Edit
          open={isFormOpen}
          onClose={handleCloseForm}
          movementId={selectedTransaction.movement_id}
          transaction={selectedTransaction}
          onEdited={infiniteQuery.onMutation}
        />
      )}
      <MovementForm
        onClose={handleCloseEditMovementForm}
        open={isEditMovementFormOpen}
        movementId={movementId}
        onGoToPrev={
          movementIdx !== NOT_FOUND && movementIdx > 0
            ? () => handleGoToRelativeMovement(-1)
            : undefined
        }
        onGoToNext={
          movementIdx !== NOT_FOUND &&
          movementIdx + 1 < infiniteQuery.data.length
            ? () => handleGoToRelativeMovement(1)
            : undefined
        }
      />
      <Bar
        accountIdState={accountIdState}
        searchState={searchState}
        dateGeState={timestampGeState}
        dateLeState={timestampLeState}
        isDescendingState={isDescendingState}
        amountGeState={amountGeState}
        amountLeState={amountLeState}
        isAmountAbsState={isAmountAbsState}
        isMultipleChoiceState={isMultipleChoiceState}
      />
      <FlexColumn.Auto reference={infiniteQuery.reference}>
        {infiniteQuery.isError && <QueryErrorMessage query={infiniteQuery} />}
        <Card.Group style={{ margin: 0, overflow: "hidden" }}>
          {infiniteQuery.data.map((t, i) => {
            if ("onFlowCheckboxChange" in props) {
              const checked = props.checked?.has(t.id);
              return (
                <TransactionCard
                  key={i}
                  transaction={t}
                  onOpenEditForm={() => handleOpenEditForm(t)}
                  onCheckboxChange={async (c) => {
                    props.onFlowCheckboxChange!(t, c);
                    infiniteQuery.onMutation();
                  }}
                  checked={checked}
                  checkBoxDisabled={checked && props.checked.size === 1}
                />
              );
            } else {
              return (
                <TransactionCard
                  key={i}
                  transaction={t}
                  onOpenEditForm={() => handleOpenEditForm(t)}
                  onCheckboxChange={
                    isMultipleChoice
                      ? (x) => handleTransactionCheckboxChange(t, x)
                      : undefined
                  }
                  checked={checkedTransactions.has(t.id)}
                  onOpenEditMovementForm={() => handleOpenEditMovementForm(t)}
                  onMutation={infiniteQuery.onMutation}
                />
              );
            }
          })}
          {infiniteQuery.isFetching && (
            <TransactionCard.Placeholder onOpenEditForm />
          )}
          {infiniteQuery.isExhausted && <ExhaustedDataCard />}
        </Card.Group>
      </FlexColumn.Auto>
      {isMultipleChoice && (
        <SpanButton
          disabled={checkedTransactions.size <= 1}
          onClick={handleMergeTransactions}
          loading={createMovementResult.isLoading}
          negative={createMovementResult.isError}
        >
          {`Combine ${checkedTransactions.size} transactions into one movement`}
        </SpanButton>
      )}
    </FlexColumn>
  );
}
