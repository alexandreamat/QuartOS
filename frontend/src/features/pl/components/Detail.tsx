import { useNavigate, useParams } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";
import Summary from "./Summary";
import FlexColumn from "components/FlexColumn";
import { MovementsByAmount } from "./MovementsByAmount";
import { addMonths } from "date-fns";
import { useState } from "react";
import Form from "features/movements/components/Form";
import { MovementApiOut } from "app/services/api";

export default function Detail(props: {}) {
  const navigate = useNavigate();
  const { year, month } = useParams();
  const startDate = new Date(Number(year), Number(month), 1);
  const endDate = addMonths(startDate, 1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showIncome, setShowIncome] = useState(true);
  const [movementId, setMovementId] = useState(0);

  function handleClickIncome() {
    setShowIncome(true);
  }

  function handleClickExpenses() {
    setShowIncome(false);
  }

  function handleOpenEditForm(movement: MovementApiOut) {
    setMovementId(movement.id)
    setIsFormOpen(true)
  }

  function handleCloseEditForm() {
    setIsFormOpen(false)
    setMovementId(0)
  }

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
      <Summary
        startDate={startDate}
        endDate={endDate}
        showIncome={showIncome}
        onClickIncome={handleClickIncome}
        onClickExpenses={handleClickExpenses}
      />
      <FlexColumn.Auto>
        <MovementsByAmount
          startDate={startDate}
          endDate={endDate}
          showIncome={showIncome}
          onOpenEditForm={handleOpenEditForm}
        />
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
