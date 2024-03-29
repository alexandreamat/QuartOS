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

import { Property } from "csstype";
import { CSSProperties, LegacyRef, ReactNode } from "react";

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
    style={{ flex: 1, overflowX: "auto", overflowY: "hidden", ...props.style }}
  >
    {props.children}
  </div>
);

export default FlexRow;
