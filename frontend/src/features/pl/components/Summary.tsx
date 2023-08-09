import { api } from "app/services/api";
import CurrencyLabel from "components/CurrencyLabel";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { addDays, format } from "date-fns";
import { Card, Label, Loader, Step } from "semantic-ui-react";

export default function Summary(props: {
  startDate: Date;
  endDate: Date;
  showIncome: boolean;
  onClickIncome: () => void;
  onClickExpenses: () => void;
}) {
  const today = new Date();
  const isOngoing = props.startDate <= today && today <= props.endDate;

  const aggregateQuery =
    api.endpoints.getAggregateApiUsersMeMovementsAggregatesStartDateEndDateGet.useQuery(
      {
        startDate: format(props.startDate, "yyyy-MM-dd"),
        endDate: format(props.endDate, "yyyy-MM-dd"),
        currencyCode: "EUR",
      }
    );

  if (aggregateQuery.isLoading || aggregateQuery.isUninitialized)
    return <Loader active size="huge" />;

  if (aggregateQuery.isError)
    return <QueryErrorMessage query={aggregateQuery} />;

  const aggregate = aggregateQuery.data;

  return (
    <Card fluid color="teal">
      <Card.Content>
        <Card.Header>
          {format(new Date(props.startDate), "MMMM yyyy")}
        </Card.Header>
        <Card.Meta>
          {`From ${props.startDate.toLocaleDateString()} to ${addDays(
            props.endDate,
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
                amount={aggregate.income}
                currencyCode={aggregate.currency_code}
              />
            </Step.Content>
          </Step>
          <Step onClick={props.onClickExpenses} active={!props.showIncome}>
            <Step.Title>Expenses</Step.Title>
            <Step.Content>
              <CurrencyLabel
                amount={aggregate.expenses}
                currencyCode={aggregate.currency_code}
              />
            </Step.Content>
          </Step>
          <Step>
            <Step.Title>Net Income</Step.Title>
            <Step.Content>
              <CurrencyLabel
                amount={aggregate.expenses + aggregate.income}
                currencyCode={aggregate.currency_code}
              />
            </Step.Content>
          </Step>
        </Step.Group>
      </Card.Content>
    </Card>
  );
}
