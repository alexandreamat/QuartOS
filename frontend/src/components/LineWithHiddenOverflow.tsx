import { CSSProperties } from "react";

export default function LineWithHiddenOverflow(props: {
  content?: string;
  style?: CSSProperties;
}) {
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
