import { format } from "date-fns";
import { CSSProperties } from "react";
import { Placeholder } from "semantic-ui-react";

export default function FormattedTimestamp(props: {
  timestamp?: string;
  loading?: boolean;
  style?: CSSProperties;
}) {
  if (props.loading)
    return (
      <Placeholder>
        <Placeholder.Header>
          <Placeholder.Line style={props.style} />
        </Placeholder.Header>
      </Placeholder>
    );

  return (
    <p style={props.style}>
      {props.timestamp && format(new Date(props.timestamp), " yyyy MMMM d")}
    </p>
  );
}
