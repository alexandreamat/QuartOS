// Copyright (C) 2023 Alexandre Amat
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
