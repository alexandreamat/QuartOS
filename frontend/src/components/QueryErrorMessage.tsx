// Copyright (C) 2023 Alexandre Amat
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
  BaseQueryFn,
  TypedUseMutationResult,
  TypedUseQueryHookResult,
} from "@reduxjs/toolkit/dist/query/react";
import { Icon, Message } from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";

export function QueryErrorMessage<R, A, Q extends BaseQueryFn>(props: {
  query: TypedUseQueryHookResult<R, A, Q> | TypedUseMutationResult<R, A, Q>;
}) {
  if (!props.query.isError) return <></>;

  console.error(props.query.error);
  console.error(props.query.originalArgs);

  return (
    <Message negative icon>
      <Icon name="exclamation triangle" />
      <Message.Content>
        <Message.Header>There's been an error</Message.Header>
        {renderErrorMessage(props.query.error)}
      </Message.Content>
    </Message>
  );
}
