import { Table } from "semantic-ui-react";

export default function TableHeader(props: {
  headers: string[];
  actions: number;
}) {
  return (
    <Table.Header>
      <Table.Row>
        {props.headers.map((header, index) => (
          <Table.HeaderCell key={index}>{header}</Table.HeaderCell>
        ))}
        {props.actions !== 0 && (
          <Table.HeaderCell colSpan={props.actions}>Actions</Table.HeaderCell>
        )}
      </Table.Row>
    </Table.Header>
  );
}
