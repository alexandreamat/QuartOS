import { SimpleQuery } from "interfaces";
import { Icon, Message } from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";

export function QueryErrorMessage(props: { query: SimpleQuery }) {
  if (!props.query.isError) return <></>;

  return (
    <Message negative icon>
      <Icon name="exclamation triangle" />
      <Message.Content>
        <Message.Header>There's been an error</Message.Header>
        {renderErrorMessage(props.query.error!)}
      </Message.Content>
    </Message>
  );
}
