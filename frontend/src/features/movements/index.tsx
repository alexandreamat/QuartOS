import {
  MovementApiOut,
  ReadManyApiUsersMeMovementsGetApiArg,
  api,
} from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { Bar, useMovementsBarState } from "./components/Bar";
import Form from "./components/Form";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDateParam } from "utils/time";
import { Card } from "semantic-ui-react";
import { MovementCard } from "./components/MovementCard";
import SpanButton from "features/transaction/components/SpanButton";
import { logMutationError } from "utils/error";
import { InfiniteScroll } from "components/InfiniteScroll";

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
  const barState = useMovementsBarState();

  const [search] = barState.searchState;
  const [startDate] = barState.startDateState;
  const [endDate] = barState.endDateState;
  const [accountId, setAccountId] = barState.accountIdState;
  const [isDescending] = barState.isDescendingState;
  const [transactionsGe] = barState.transactionsGeState;
  const [transactionsLe] = barState.transactionsLeState;
  const [amountGe] = barState.amountGeState;
  const [amountLe] = barState.amountLeState;
  const [isAmountAbs] = barState.isAmountAbsState;
  const [isMultipleChoice, setIsMultipleChoice] =
    barState.isMultipleChoiceState;

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

  const [createMovement, createMovementResult] =
    api.endpoints.createApiUsersMeMovementsPost.useMutation();

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

  // function handleGoToRelativeMovement(x: number) {
  //   setMovementId(infiniteQuery.data[movementIdx + x]?.id || 0);
  // }

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

  const Item = ({ response }: { response: MovementApiOut }) => (
    <MovementCard
      key={response.id}
      movement={response}
      onOpenEditForm={() => handleOpenEditForm(response.id)}
      selectedAccountId={accountId}
      showFlows={response.transactions.length > 1}
      checked={checkedMovements.has(response)}
      onCheckedChange={
        isMultipleChoice
          ? (value) => handleCheckedChange(response, value)
          : undefined
      }
    />
  );

  return (
    <FlexColumn>
      <Form
        open={isFormOpen}
        onClose={handleCloseForm}
        movementId={movementId}
        // onGoToPrev={
        //   movementIdx !== NOT_FOUND && movementIdx > 0
        //     ? () => handleGoToRelativeMovement(-1)
        //     : undefined
        // }
        // onGoToNext={
        //   movementIdx !== NOT_FOUND &&
        //   movementIdx + 1 < infiniteQuery.data.length
        //     ? () => handleGoToRelativeMovement(1)
        //     : undefined
        // }
      />
      <Bar onOpenCreateForm={handleOpenCreateForm} barState={barState} />
      <FlexColumn.Auto reference={reference}>
        <Card.Group style={{ margin: 0 }}>
          <InfiniteScroll
            item={Item}
            endpoint={api.endpoints.readManyApiUsersMeMovementsGet}
            params={arg}
            reference={reference}
          />
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
