import { api } from "app/services/api";
import CurrencyLabel from "components/CurrencyLabel";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { addDays, addMonths, format } from "date-fns";
import { useParams } from "react-router-dom";
import { Card, Loader, Step } from "semantic-ui-react";

export default function Summary() {
  const { year, month } = useParams();

  const startDate = new Date(Number(year), Number(month), 1);
  const endDate = addMonths(startDate, 1);

  const aggregateQuery =
    api.endpoints.getAggregateApiMovementsAggregatesStartDateEndDateGet.useQuery(
      {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
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
        <Card.Header>{format(new Date(startDate), "MMMM yyyy")}</Card.Header>
        <Card.Meta>
          {`From ${startDate.toLocaleDateString()}
      to ${addDays(endDate, -1).toLocaleDateString()}`}
        </Card.Meta>
      </Card.Content>
      <Card.Content extra>
        <Step.Group fluid widths={3}>
          <Step>
            <Step.Title>Income</Step.Title>
            <Step.Content>
              <CurrencyLabel
                amount={aggregate.income}
                currencyCode={aggregate.currency_code}
              />
            </Step.Content>
          </Step>
          <Step>
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
