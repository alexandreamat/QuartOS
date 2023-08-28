import { PlStatement, api } from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { useNavigate } from "react-router-dom";
import { Card, Loader, Table } from "semantic-ui-react";
import PLCard from "./components/PLCard";
import FlexColumn from "components/FlexColumn";

function Row(props: { plStatement: PlStatement }) {
  const navigate = useNavigate();

  function handleGoToDetail() {
    navigate(
      `/pl-statements/${props.plStatement.start_date}/${props.plStatement.end_date}`
    );
  }
  return (
    <PLCard aggregate={props.plStatement} onGoToDetail={handleGoToDetail} />
  );
}

export default function IncomeStatement() {
  const aggregatesQuery =
    api.endpoints.getManyAggregatesApiUsersMeMovementsAggregatesGet.useQuery({
      currencyCode: "EUR",
    });

  if (aggregatesQuery.isUninitialized || aggregatesQuery.isLoading)
    return <Loader active size="huge" />;

  if (aggregatesQuery.isError)
    return <QueryErrorMessage query={aggregatesQuery} />;

  return (
    <FlexColumn>
      <FlexColumn.Auto>
        <Card.Group style={{ margin: 0 }}>
          {aggregatesQuery.data.map((aggregate) => (
            <Row key={aggregate.start_date} plStatement={aggregate} />
          ))}
        </Card.Group>
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
