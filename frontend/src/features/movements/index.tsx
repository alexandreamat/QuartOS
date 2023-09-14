import {
  MovementApiOut,
  ReadManyApiUsersMeMovementsGetApiArg,
  api,
} from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { Bar } from "./components/Bar";
import Form from "./components/Form";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "hooks/useInfiniteQuery";
import { formatDateParam } from "utils/time";
import { Card } from "semantic-ui-react";
import { MovementCard } from "./components/MovementCard";
import ExhaustedDataCard from "components/ExhaustedDataCard";
import SpanButton from "features/transaction/components/SpanButton";
import { logMutationError } from "utils/error";

const PER_PAGE = 10;
const NOT_FOUND = -1;

export default function Movements() {
  const location = useLocation();
  const navigate = useNavigate();

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [movementId, setMovementId] = useState(0);
  const [checkedMovements, setCheckedMovements] = useState(
    new Set<MovementApiOut>(),
  );

  // Bar state
  const searchState = useState<string | undefined>(undefined);
  const startDateState = useState<Date | undefined>(undefined);
  const endDateState = useState<Date | undefined>(undefined);
  const accountIdState = useState<number | undefined>(undefined);
  const transactionsGeState = useState<number | undefined>(undefined);
  const transactionsLeState = useState<number | undefined>(undefined);
  const isDescendingState = useState(true);
  const amountGeState = useState<number>();
  const amountLeState = useState<number>();
  const isAmountAbsState = useState(false);
  const isMultipleChoiceState = useState(false);

  const [search] = searchState;
  const [startDate] = startDateState;
  const [endDate] = endDateState;
  const [accountId, setAccountId] = accountIdState;
  const [isDescending] = isDescendingState;
  const [transactionsGe] = transactionsGeState;
  const [transactionsLe] = transactionsLeState;
  const [amountGe] = amountGeState;
  const [amountLe] = amountLeState;
  const [isAmountAbs] = isAmountAbsState;
  const [isMultipleChoice, setIsMultipleChoice] = isMultipleChoiceState;

  const arg: ReadManyApiUsersMeMovementsGetApiArg = {
    search: search,
    isDescending,
    startDate: startDate && formatDateParam(startDate),
    endDate: endDate && formatDateParam(endDate),
    accountId,
    transactionsGe,
    transactionsLe,
    amountGe,
    amountLe,
    isAmountAbs,
  };

  const reference = useRef<HTMLDivElement | null>(null);

  const infiniteQuery = useInfiniteQuery(
    api.endpoints.readManyApiUsersMeMovementsGet,
    arg,
    PER_PAGE,
    reference,
  );

  const [createMovement, createMovementResult] =
    api.endpoints.createApiUsersMeMovementsPost.useMutation();

  const movementIdx = infiniteQuery.data.findIndex((m) => m.id === movementId);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const isFormOpenParam = params.get("isFormOpen");
    if (isFormOpenParam) {
      setIsFormOpen(isFormOpenParam === "true");
      params.delete("isFormOpen");
      navigate({ ...location, search: params.toString() }, { replace: true });
    }

    const accountIdParam = Number(params.get("accountId"));
    if (accountIdParam) {
      setAccountId(Number(accountIdParam));
      params.delete("accountId");
      navigate({ ...location, search: params.toString() }, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!isMultipleChoice) setCheckedMovements(new Set());
  }, [isMultipleChoice]);

  const handleOpenCreateForm = () => {
    setMovementId(0);
    setIsFormOpen(true);
  };

  function handleOpenEditForm(id: number) {
    setMovementId(id);
    setIsFormOpen(true);
  }

  function handleGoToRelativeMovement(x: number) {
    setMovementId(infiniteQuery.data[movementIdx + x]?.id || 0);
  }

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setMovementId(0);
  };

  function handleCheckedChange(movement: MovementApiOut, checked: boolean) {
    setCheckedMovements((x) => {
      if (checked) x.add(movement);
      else x.delete(movement);
      return new Set(x);
    });
  }

  async function handleMergeMovements() {
    const childrenIds = [...checkedMovements]
      .map((m) => m.transactions.map((t) => t.id))
      .flat(1);

    try {
      await createMovement(childrenIds).unwrap();
    } catch (error) {
      logMutationError(error, createMovementResult);
    }
    setIsMultipleChoice(false);
    setCheckedMovements(new Set());
  }

  return (
    <FlexColumn>
      <Form
        open={isFormOpen}
        onClose={handleCloseForm}
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
        onOpenCreateForm={handleOpenCreateForm}
        searchState={searchState}
        startDateState={startDateState}
        endDateState={endDateState}
        accountIdState={accountIdState}
        isDescendingState={isDescendingState}
        transactionsGeState={transactionsGeState}
        transactionsLeState={transactionsLeState}
        amountGeState={amountGeState}
        amountLeState={amountLeState}
        isAmountAbsState={isAmountAbsState}
        isMultipleChoiceState={isMultipleChoiceState}
      />
      <FlexColumn.Auto reference={infiniteQuery.reference}>
        <Card.Group style={{ margin: 0 }}>
          {infiniteQuery.isError && <QueryErrorMessage query={infiniteQuery} />}
          {infiniteQuery.data.map((m) => (
            <MovementCard
              key={m.id}
              movement={m}
              onOpenEditForm={() => handleOpenEditForm(m.id)}
              selectedAccountId={accountId}
              showFlows={m.transactions.length > 1}
              checked={checkedMovements.has(m)}
              onCheckedChange={
                isMultipleChoice
                  ? (value) => handleCheckedChange(m, value)
                  : undefined
              }
            />
          ))}
          {infiniteQuery.isFetching && <MovementCard loading />}
          {infiniteQuery.isExhausted && <ExhaustedDataCard />}
        </Card.Group>
      </FlexColumn.Auto>
      {isMultipleChoice && (
        <SpanButton
          disabled={checkedMovements.size <= 1}
          onClick={handleMergeMovements}
          loading={createMovementResult.isLoading}
          negative={createMovementResult.isError}
        >
          {`Merge ${checkedMovements.size} ${
            checkedMovements.size === 1 ? "movement" : "movements"
          } into one`}
        </SpanButton>
      )}
    </FlexColumn>
  );
}
