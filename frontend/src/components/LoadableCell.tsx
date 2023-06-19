import { Message } from "semantic-ui-react";
import LoadableLine from "./LoadableLine";
import { ReactNode } from "react";
import { SimpleQuery } from "interfaces";
import { renderErrorMessage } from "utils/error";

export default function LoadableQuery(props: {
  query: SimpleQuery;
  children: ReactNode;
  collapsing?: boolean;
}) {
  return (
    <LoadableLine isLoading={props.query.isLoading}>
      {props.query.isSuccess && props.children}
      {props.query.isError && (
        <Message negative>{renderErrorMessage(props.query.error!)}</Message>
      )}
    </LoadableLine>
  );
}
