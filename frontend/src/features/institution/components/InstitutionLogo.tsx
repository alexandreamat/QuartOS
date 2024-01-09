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

import { Image, Icon, SemanticFLOATS, Placeholder } from "semantic-ui-react";
import { InstitutionApiOut } from "app/services/api";
import { CSSProperties } from "react";

export function InstitutionLogo(props: {
  institution?: InstitutionApiOut;
  floated?: SemanticFLOATS;
  loading?: boolean;
  style?: CSSProperties;
}) {
  if (props.loading)
    return (
      <Placeholder image style={props.style}>
        <Placeholder.Header />
      </Placeholder>
    );

  if (props.institution?.logo_base64 !== undefined)
    return (
      <Image
        centered
        floated={props.floated}
        style={{ ...props.style, height: "auto" }}
        src={`data:image/png;base64,${props.institution.logo_base64}`}
      />
    );

  return <Icon size="large" name="university" style={props.style} />;
}
