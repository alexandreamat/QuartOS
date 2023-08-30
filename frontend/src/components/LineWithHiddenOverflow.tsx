export default function LineWithHiddenOverflow(props: { content: string }) {
  return (
    <p
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {props.content}
    </p>
  );
}
