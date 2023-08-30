import React, { CSSProperties, ReactNode, LegacyRef } from "react";

const FlexRow = (props: { children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      display: "flex",
      width: "100%",
      ...props.style,
    }}
  >
    {props.children}
  </div>
);

FlexRow.Auto = (props: {
  children: ReactNode;
  style?: CSSProperties;
  reference?: LegacyRef<HTMLDivElement>;
}) => (
  <div
    ref={props.reference}
    style={{ flex: 1, padding: 1, overflow: "auto", ...props.style }}
  >
    {props.children}
  </div>
);

export default FlexRow;
