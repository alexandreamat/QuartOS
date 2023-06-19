import React, { CSSProperties, ReactNode, LegacyRef } from "react";

const FlexColumn = (props: { children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      ...props.style,
    }}
  >
    {props.children}
  </div>
);

FlexColumn.Auto = (props: {
  children: ReactNode;
  style?: CSSProperties;
  reference?: LegacyRef<HTMLDivElement>;
}) => (
  <div
    ref={props.reference}
    style={{ flex: 1, overflow: "auto", ...props.style }}
  >
    {props.children}
  </div>
);

export default FlexColumn;
