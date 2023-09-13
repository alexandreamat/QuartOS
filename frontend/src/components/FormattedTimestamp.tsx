import { format } from "date-fns";
import { Placeholder } from "semantic-ui-react";

export default function FormattedTimestamp(props: {
  timestamp?: string;
  loading?: boolean;
}) {
  if (props.loading)
    return (
      <Placeholder as="p">
        <Placeholder.Line />
      </Placeholder>
    );

  return (
    <p
      style={{
        width: "9em",
      }}
    >
      {props.timestamp && format(new Date(props.timestamp), " yyyy MMMM d")}
    </p>
  );
}
