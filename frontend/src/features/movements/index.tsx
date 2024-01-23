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

import {
  MovementApiOut,
  ReadManyUsersMeMovementsGetApiArg,
  api,
} from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { InfiniteScroll } from "components/InfiniteScroll";
import SpanButton from "features/transaction/components/SpanButton";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "semantic-ui-react";
import { PaginatedItemProps } from "types";
import { logMutationError } from "utils/error";
import { formatDateParam } from "utils/time";
import { Bar, useMovementsBarState } from "./components/Bar";
import Form from "./components/Form";
import { MovementCard } from "./components/MovementCard";

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
  const [isDescending] = barState.isDescendingState;
  const [transactionsGe] = barState.transactionsGeState;
  const [transactionsLe] = barState.transactionsLeState;
  const [amountGe] = barState.amountGeState;
  const [amountLe] = barState.amountLeState;
  const [isAmountAbs] = barState.isAmountAbsState;
  const [isMultipleChoice, setIsMultipleChoice] =
    barState.isMultipleChoiceState;

  const arg: ReadManyUsersMeMovementsGetApiArg = {
    search: search,
    isDescending,
    startDate: startDate && formatDateParam(startDate),
    endDate: endDate && formatDateParam(endDate),
    transactionsGe,
    transactionsLe,
    amountGe,
    amountLe,
    isAmountAbs,
  };

  const reference = useRef<HTMLDivElement | null>(null);

  const [mergeMovements, mergeMovementsResult] =
    api.endpoints.mergeUsersMeMovementsMergePost.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const isFormOpenParam = params.get("isFormOpen");
    if (isFormOpenParam) {
      setIsFormOpen(isFormOpenParam === "true");
      params.delete("isFormOpen");
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
    const checkedMovementIds = [...checkedMovements].map((m) => m.id);
    try {
      await mergeMovements(checkedMovementIds).unwrap();
    } catch (error) {
      logMutationError(error, mergeMovementsResult);
    }
    setIsMultipleChoice(false);
    setCheckedMovements(new Set());
  }

  const CardGenerator = ({
    response: m,
    loading,
  }: PaginatedItemProps<MovementApiOut>) => (
    <MovementCard
      key={m?.id}
      movement={m}
      onOpenEditForm={() => m && handleOpenEditForm(m.id)}
      checked={m && checkedMovements.has(m)}
      onCheckedChange={
        isMultipleChoice
          ? (value) => m && handleCheckedChange(m, value)
          : undefined
      }
      loading={loading}
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
        <Card.Group style={{ margin: 1 }}>
          <InfiniteScroll
            itemRenderer={CardGenerator}
            endpoint={api.endpoints.readManyUsersMeMovementsGet}
            params={arg}
            reference={reference}
          />
        </Card.Group>
      </FlexColumn.Auto>
      {isMultipleChoice && (
        <SpanButton
          disabled={checkedMovements.size <= 1}
          onClick={handleMergeMovements}
          loading={mergeMovementsResult.isLoading}
          negative={mergeMovementsResult.isError}
        >
          {`Merge ${checkedMovements.size} ${
            checkedMovements.size === 1 ? "movement" : "movements"
          } into one`}
        </SpanButton>
      )}
    </FlexColumn>
  );
}
