import { useNavigate, useParams } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";
import Summary from "./Summary";
import FlexColumn from "components/FlexColumn";
import { MovementsByAmount } from "./MovementsByAmount";
import { addMonths } from "date-fns";
import { useState } from "react";

export default function Detail(props: {}) {
  const navigate = useNavigate();
  const { year, month } = useParams();
  const startDate = new Date(Number(year), Number(month), 1);
  const endDate = addMonths(startDate, 1);

  const [showIncome, setShowIncome] = useState(true);

  function handleClickIncome() {
    setShowIncome(true);
  }

  function handleClickExpenses() {
    setShowIncome(false);
  }

  return (
    <>
      <FlexColumn>
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
          onClickIncome={handleClickIncome}
          onClickExpenses={handleClickExpenses}
        />
        <FlexColumn.Auto>
          <MovementsByAmount
            startDate={startDate}
            endDate={endDate}
            showIncome={showIncome}
          />
        </FlexColumn.Auto>
      </FlexColumn>
    </>
  );
}
