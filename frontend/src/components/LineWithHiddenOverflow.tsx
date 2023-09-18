import { CSSProperties } from "react";
import { Placeholder } from "semantic-ui-react";

export default function LineWithHiddenOverflow(props: {
  content?: string;
  style?: CSSProperties;
  loading?: boolean;
}) {
  if (props.loading)
    return (
      <Placeholder style={{ margin: 0 }}>
        <Placeholder.Header>
          <Placeholder.Line style={{ ...props.style }} />
        </Placeholder.Header>
      </Placeholder>
    );

  return (
    <p
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        ...props.style,
      }}
    >
      {props.content}
    </p>
  );
}
