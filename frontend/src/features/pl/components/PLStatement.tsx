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

import { skipToken } from "@reduxjs/toolkit/dist/query";
import { MovementApiOut, api } from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import Form from "features/movements/components/Form";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Icon, Loader } from "semantic-ui-react";
import PLCard from "./PLCard";
import PLMovements from "./PLMovements";

export default function PLStatement() {
  const navigate = useNavigate();
  const { startDate } = useParams();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showIncome, setShowIncome] = useState(true);
  const [movementId, setMovementId] = useState(0);

  const aggregateQuery =
    api.endpoints.getPlStatementUsersMeAnalyticsMonthGet.useQuery(
      startDate ? startDate : skipToken,
    );

  function handleClickIncome() {
    setShowIncome(true);
  }

  function handleClickExpenses() {
    setShowIncome(false);
  }

  function handleOpenEditForm(movement: MovementApiOut) {
    setMovementId(movement.id);
    setIsFormOpen(true);
  }

  function handleCloseEditForm() {
    setIsFormOpen(false);
    setMovementId(0);
  }

  if (aggregateQuery.isLoading || aggregateQuery.isUninitialized)
    return <Loader active size="huge" />;

  if (aggregateQuery.isError)
    return <QueryErrorMessage query={aggregateQuery} />;

  return (
    <FlexColumn>
      <Form
        open={isFormOpen}
        onClose={handleCloseEditForm}
        movementId={movementId}
      />
      <div>
        <Button
          icon
          labelPosition="left"
          color="blue"
          onClick={() => navigate(-1)}
        >
          <Icon name="arrow left" />
          Go back
        </Button>
      </div>
      <PLCard
        aggregate={aggregateQuery.data}
        showIncome={showIncome}
        onClickIncome={handleClickIncome}
        onClickExpenses={handleClickExpenses}
      />
      <FlexColumn.Auto>
        <PLMovements
          aggregate={aggregateQuery.data}
          showIncome={showIncome}
          onOpenEditForm={handleOpenEditForm}
        />
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
