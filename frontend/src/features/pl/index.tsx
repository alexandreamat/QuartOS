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

import {
  AggregateBy,
  GetManyPlStatementsUsersMeAnalyticsGetApiArg,
  PlStatementApiOut,
  api,
} from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { InfiniteScroll } from "components/InfiniteScroll";
import { useRef, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Card } from "semantic-ui-react";
import { PaginatedItemProps } from "types";
import PLCard from "./components/PLCard";
import { dateToString } from "utils/time";
import PlBar from "./components/Bar";
import PLStatement from "./components/PLStatement";

function Row(props: {
  plStatement?: PlStatementApiOut;
  loading?: boolean;
  aggregateBy: AggregateBy;
}) {
  const navigate = useNavigate();

  function handleGoToStatement() {
    if (!props.plStatement) return;

    navigate(
      `/pl-statements/${dateToString(
        props.plStatement.timestamp__ge,
      )}/${dateToString(props.plStatement.timestamp__lt)}`,
    );
  }
  return (
    <PLCard
      detailedPlStatement={props.plStatement}
      aggregateBy={props.aggregateBy}
      onGoToDetail={handleGoToStatement}
      loading={props.loading}
    />
  );
}

export default function IncomeStatement() {
  const reference = useRef<HTMLDivElement | null>(null);

  const bucketIdState = useState<number>();
  const aggregateByState = useState<AggregateBy>("monthly");

  const [bucketId, setBucketId] = bucketIdState;
  const [aggregateBy, setAggregateBy] = aggregateByState;

  const CardComponent = ({
    response: pl,
    loading,
  }: PaginatedItemProps<PlStatementApiOut>) => (
    <Row
      key={pl?.timestamp__ge.toDateString()}
      plStatement={pl}
      loading={loading}
      aggregateBy={aggregateBy}
    />
  );

  const arg: GetManyPlStatementsUsersMeAnalyticsGetApiArg = {
    bucketId,
    aggregateBy,
  };

  return (
    <FlexColumn>
      <PlBar
        bucketIdState={bucketIdState}
        aggregateByState={aggregateByState}
      />
      <FlexColumn.Auto reference={reference}>
        <Routes>
          <Route
            path="*"
            element={
              <Card.Group style={{ margin: 0 }}>
                <InfiniteScroll.Simple
                  itemComponent={CardComponent}
                  reference={reference}
                  endpoint={
                    api.endpoints.getManyPlStatementsUsersMeAnalyticsGet
                  }
                  params={arg}
                />
              </Card.Group>
            }
          />
          <Route
            path=":timestampGe/:timestampLt"
            element={
              <PLStatement aggregateBy={aggregateBy} bucketId={bucketId} />
            }
          />
        </Routes>
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
