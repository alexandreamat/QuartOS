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
import { Button, Card, Menu } from "semantic-ui-react";
import { formatDateParam } from "utils/time";
import ExhaustedDataCard from "components/ExhaustedDataCard";
import MovementForm from "features/movements/components/Form";
import { logMutationError } from "utils/error";

const NOT_FOUND = -1;

export default function TransactionCards(
  props:
    | {
        // from movement form
        onFlowCheckboxChange: (t: TransactionApiOut, x: boolean) => void;
        checked: Set<number>;
      }
    | {
        // from index
        accountId: number;
      }
) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [selectedTransaction, setSelectedTransaction] = useState<
    TransactionApiOut | undefined
  >(undefined);

  const [selectedAccountId, setSelectedAccountId] = useState(0);
  const [accountId, setAccountId] = useState<number | undefined>(
    "accountId" in props ? props.accountId : undefined
  );
  const [search, setSearch] = useState("");
  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(true);
  const [amountGe, setAmountGe] = useState<number | undefined>(undefined);
  const [amountLe, setAmountLe] = useState<number | undefined>(undefined);

  const [isEditMovementFormOpen, setIsEditMovementFormOpen] = useState(false);
  const [movementId, setMovementId] = useState<number | undefined>(undefined);

  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
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
    setSelectedAccountId(0);
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedAccountId(0);
    setSelectedTransaction(undefined);
    setIsFormOpen(false);
  };

  const queryArg: ReadManyApiUsersMeTransactionsGetApiArg = {
    timestamp: timestamp && formatDateParam(timestamp),
    search,
    isDescending,
    amountGe,
    amountLe,
    accountId,
  };

  const infiniteQuery = useInfiniteQuery(
    api.endpoints.readManyApiUsersMeTransactionsGet,
    queryArg,
    20
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
          accountId={selectedAccountId}
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
        accountId={accountId}
        onAccountIdChange={setAccountId}
        search={search}
        onSearchChange={setSearch}
        timestamp={timestamp}
        onTimestampChange={setTimestamp}
        isDescending={isDescending}
        onIsDescendingToggle={() => setIsDescending((x) => !x)}
        amountGe={amountGe}
        onAmountGeChange={setAmountGe}
        amountLe={amountLe}
        onAmountLeChange={setAmountLe}
        isMultipleChoice={isMultipleChoice}
        onIsMultipleChoiceChange={(x) => {
          setCheckedTransactions(new Set());
          setIsMultipleChoice(x);
        }}
      />
      <FlexColumn.Auto reference={infiniteQuery.reference}>
        {infiniteQuery.isError && <QueryErrorMessage query={infiniteQuery} />}
        <Card.Group style={{ margin: 0 }}>
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
                  checkBoxDisabled={checked && props.checked.size === 1}
                  checked={checked}
                />
              );
            } else {
              return (
                <TransactionCard
                  key={i}
                  transaction={t}
                  onOpenEditMovementForm={() => handleOpenEditMovementForm(t)}
                  onOpenEditForm={() => handleOpenEditForm(t)}
                  onCheckboxChange={
                    isMultipleChoice
                      ? (x) => handleTransactionCheckboxChange(t, x)
                      : undefined
                  }
                  checked={checkedTransactions.has(t.id)}
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
        <Menu secondary>
          <Menu.Item style={{ width: "100%" }}>
            <Button
              fluid
              positive
              circular
              disabled={checkedTransactions.size <= 1}
              onClick={handleMergeTransactions}
              loading={createMovementResult.isLoading}
              negative={createMovementResult.isError}
            >
              {`Combine ${checkedTransactions.size} transactions into one movement`}
            </Button>
          </Menu.Item>
        </Menu>
      )}
    </FlexColumn>
  );
}
