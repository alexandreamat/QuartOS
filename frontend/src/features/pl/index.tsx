import { PlStatement, api } from "app/services/api";
import ActionButton from "components/ActionButton";
import CurrencyLabel from "components/CurrencyLabel";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Header, Loader, Table } from "semantic-ui-react";

function Row(props: { plStatement: PlStatement }) {
  const navigate = useNavigate();

  function handleGoToDetail() {
    navigate(
      `/pl-statements/${props.plStatement.start_date}/${props.plStatement.end_date}`
    );
  }

  return (
    <Table.Row>
      <Table.Cell>
        <Header as="h5">
          {format(new Date(props.plStatement.start_date), "MMMM yyyy")}
        </Header>
      </Table.Cell>
      <Table.Cell>
        <CurrencyLabel
          amount={props.plStatement.income}
          currencyCode={props.plStatement.currency_code}
        />
      </Table.Cell>
      <Table.Cell>
        <CurrencyLabel
          amount={props.plStatement.expenses}
          currencyCode={props.plStatement.currency_code}
        />
      </Table.Cell>
      <Table.Cell>
        <CurrencyLabel
          amount={props.plStatement.income + props.plStatement.expenses}
          currencyCode={props.plStatement.currency_code}
        />
      </Table.Cell>
      <Table.Cell>
        <ActionButton
          onClick={handleGoToDetail}
          tooltip="Detail"
          icon="ellipsis horizontal"
        />
      </Table.Cell>
    </Table.Row>
  );
}

export default function IncomeStatement() {
  const aggregatesQuery =
    api.endpoints.getManyAggregatesApiUsersMeMovementsAggregatesGet.useQuery({
      currencyCode: "EUR",
    });

  if (aggregatesQuery.isLoading) return <Loader active size="huge" />;

  if (aggregatesQuery.isError)
    return <QueryErrorMessage query={aggregatesQuery} />;

  if (aggregatesQuery.isSuccess)
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Month</Table.HeaderCell>
            <Table.HeaderCell>Income</Table.HeaderCell>
            <Table.HeaderCell>Expenses</Table.HeaderCell>
            <Table.HeaderCell>Net income</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {aggregatesQuery.data.map((aggregate) => (
            <Row key={aggregate.start_date} plStatement={aggregate} />
          ))}
        </Table.Body>
      </Table>
    );
}
