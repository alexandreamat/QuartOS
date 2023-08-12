import { PlStatement } from "app/services/api";
import CurrencyLabel from "components/CurrencyLabel";
import { addDays, format } from "date-fns";
import { Card, Label, Step } from "semantic-ui-react";

export default function Summary(props: {
  aggregate: PlStatement;
  showIncome: boolean;
  onClickIncome: () => void;
  onClickExpenses: () => void;
}) {
  const startDate = new Date(props.aggregate.start_date);
  const endDate = new Date(props.aggregate.end_date);
  const today = new Date();
  const isOngoing = startDate <= today && today <= endDate;

  return (
    <Card fluid color="teal">
      <Card.Content>
        <Card.Header>
          {format(new Date(props.aggregate.start_date), "MMMM yyyy")}
        </Card.Header>
        <Card.Meta>
          {`From ${startDate.toLocaleDateString()} to ${addDays(
            endDate,
            -1
          ).toLocaleDateString()}`}
          {isOngoing && (
            <Label
              color="teal"
              style={{ marginLeft: "0.5rem", verticalAlign: "middle" }}
            >
              Ongoing
            </Label>
          )}
        </Card.Meta>
      </Card.Content>
      <Card.Content extra>
        <Step.Group fluid widths={3}>
          <Step onClick={props.onClickIncome} active={props.showIncome}>
            <Step.Title>Income</Step.Title>
            <Step.Content>
              <CurrencyLabel
                amount={props.aggregate.income}
                currencyCode={props.aggregate.currency_code}
              />
            </Step.Content>
          </Step>
          <Step onClick={props.onClickExpenses} active={!props.showIncome}>
            <Step.Title>Expenses</Step.Title>
            <Step.Content>
              <CurrencyLabel
                amount={props.aggregate.expenses}
                currencyCode={props.aggregate.currency_code}
              />
            </Step.Content>
          </Step>
          <Step>
            <Step.Title>Net Income</Step.Title>
            <Step.Content>
              <CurrencyLabel
                amount={props.aggregate.expenses + props.aggregate.income}
                currencyCode={props.aggregate.currency_code}
              />
            </Step.Content>
          </Step>
        </Step.Group>
      </Card.Content>
    </Card>
  );
}
