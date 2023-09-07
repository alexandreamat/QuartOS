import { format } from "date-fns";

export default function FormattedTimestamp(props: { timestamp?: string }) {
  return (
    <p style={{ width: "10em" }}>
      {props.timestamp && format(new Date(props.timestamp), " yyyy MMMM d")}
    </p>
  );
}
