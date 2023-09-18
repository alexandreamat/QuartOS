import { PlStatement, api } from "app/services/api";
import { useNavigate } from "react-router-dom";
import { Card } from "semantic-ui-react";
import PLCard from "./components/PLCard";
import FlexColumn from "components/FlexColumn";
import { useRef } from "react";
import { InfiniteScroll } from "components/InfiniteScroll";
import { PaginatedItemProps } from "types";

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

  const CardRenderer = ({
    response: pl,
    loading,
  }: PaginatedItemProps<PlStatement>) => (
    <Row key={pl?.start_date} plStatement={pl} loading={loading} />
  );

  return (
    <FlexColumn>
      <FlexColumn.Auto reference={reference}>
        <Card.Group style={{ margin: 0 }}>
          <InfiniteScroll
            itemRenderer={CardRenderer}
            reference={reference}
            endpoint={
              api.endpoints.getManyAggregatesApiUsersMeMovementsAggregatesGet
            }
            params={{}}
          />
        </Card.Group>
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
