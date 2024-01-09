// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
    style={{ flex: 1, padding: 1, overflow: "auto", ...props.style }}
  >
    {props.children}
  </div>
);

export default FlexColumn;
