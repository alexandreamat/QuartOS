import React, { CSSProperties, ReactNode } from "react";

type JustifyContent = "space-between" | "left" | "right";

export default function Inline(props: {
  children: ReactNode;
  justifyContent?: JustifyContent;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: props.justifyContent || "space-between",
        alignItems: "center",
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}
