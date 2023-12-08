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
              api.endpoints.getManyAggregatesUsersMeMovementsAggregatesGet
            }
            params={{}}
          />
        </Card.Group>
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
