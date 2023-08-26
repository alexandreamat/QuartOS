import React, { ReactNode } from "react";

export default function Inline(props: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
      }}
    >
      {props.children}
    </div>
  );
}
