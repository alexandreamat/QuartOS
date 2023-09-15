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
