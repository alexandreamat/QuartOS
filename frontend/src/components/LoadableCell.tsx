import { Message, Table } from "semantic-ui-react";
import LoadableLine from "./LoadableLine";
import { ReactNode } from "react";

export default function LoadableCell(props: {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: string;
  children: ReactNode;
  collapsing?: boolean;
}) {
  return (
    <Table.Cell collapsing>
      <LoadableLine isLoading={props.isLoading}>
        {props.isSuccess && props.children}
        {props.isError && <Message negative>{props.error}</Message>}
      </LoadableLine>
    </Table.Cell>
  );
}
