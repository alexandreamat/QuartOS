import {
  GetManyAggregatesApiUsersMeMovementsAggregatesGetApiArg,
  PlStatement,
  api,
} from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { useNavigate } from "react-router-dom";
import { Card } from "semantic-ui-react";
import PLCard from "./components/PLCard";
import FlexColumn from "components/FlexColumn";
import { useInfiniteQuery } from "hooks/useInfiniteQuery";
import { useRef } from "react";

function Row(props: { plStatement?: PlStatement; loading?: boolean }) {
  const navigate = useNavigate();

  function handleGoToDetail() {
    if (!props.plStatement) return;

    navigate(
      `/pl-statements/${props.plStatement.start_date}/${props.plStatement.end_date}`,
    );
  }
  return (
    <PLCard
      aggregate={props.plStatement}
      onGoToDetail={handleGoToDetail}
      loading={props.loading}
    />
  );
}

export default function IncomeStatement() {
  const reference = useRef<HTMLDivElement | null>(null);

  const aggregatesQuery = useInfiniteQuery(
    api.endpoints.getManyAggregatesApiUsersMeMovementsAggregatesGet,
    {
      currencyCode: "EUR",
    } as GetManyAggregatesApiUsersMeMovementsAggregatesGetApiArg,
    12,
    reference,
  );

  return (
    <FlexColumn>
      <FlexColumn.Auto reference={aggregatesQuery.reference}>
        <Card.Group style={{ margin: 0 }}>
          {aggregatesQuery.data.map((aggregate) => (
            <Row key={aggregate.start_date} plStatement={aggregate} />
          ))}
          {aggregatesQuery.isFetching && <Row loading />}
        </Card.Group>
      </FlexColumn.Auto>
      {aggregatesQuery.error && <QueryErrorMessage query={aggregatesQuery} />}
    </FlexColumn>
  );
}
