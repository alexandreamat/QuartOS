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

import { AggregateBy } from "app/services/api";
import FlexRow from "components/FlexRow";
import MenuDropdown from "components/MenuDropdown";
import { useBucketOptions } from "features/buckets/hooks";
import { Menu } from "semantic-ui-react";
import { UseStateType } from "types";
import { capitaliseFirstLetter } from "utils/string";

export default function PlBar(props: {
  bucketIdState: UseStateType<number | undefined>;
  aggregateByState: UseStateType<AggregateBy>;
}) {
  const bucketOptions = useBucketOptions();
  return (
    <FlexRow>
      <FlexRow.Auto>
        {/* Correct negative margins that would add unnecessary scroll bar */}
        <Menu secondary style={{ margin: 0 }}>
          <MenuDropdown
            state={props.bucketIdState}
            error={bucketOptions.query.isError}
            loading={bucketOptions.query.isLoading}
            options={bucketOptions.options}
            placeholder="Filter by bucket"
            icon="bitbucket"
          />
          <MenuDropdown
            state={props.aggregateByState}
            required
            options={["yearly", "quarterly", "monthly", "weekly", "daily"].map(
              (o) => ({
                text: capitaliseFirstLetter(o),
                value: o,
              }),
            )}
            placeholder="Aggregate by period"
            icon="calendar plus"
          />
        </Menu>
      </FlexRow.Auto>
    </FlexRow>
  );
}
