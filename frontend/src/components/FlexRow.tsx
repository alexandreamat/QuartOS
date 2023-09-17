import React, { CSSProperties, ReactNode, LegacyRef } from "react";
import { Property } from "csstype";

const FlexRow = (props: {
  children: ReactNode;
  justifyContent?: Property.JustifyContent;
  gap?: Property.Gap;
  alignItems?: Property.AlignItems;
  style?: CSSProperties;
}) => (
  <div
    style={{
      display: "flex",
      width: "100%",
      justifyContent: props.justifyContent,
      gap: props.gap,
      alignItems: props.alignItems,
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
