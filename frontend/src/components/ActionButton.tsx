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

import { CSSProperties } from "react";
import {
  Button,
  Popup,
  SemanticCOLORS,
  SemanticFLOATS,
  SemanticICONS,
} from "semantic-ui-react";

const ActionButton = (props: {
  onClick?: () => void;
  tooltip?: string;
  icon: SemanticICONS;
  disabled?: boolean;
  content?: string;
  color?: SemanticCOLORS;
  floated?: SemanticFLOATS;
  style?: CSSProperties;
  loading?: boolean;
  negative?: boolean;
}) => (
  <Popup
    disabled={props.tooltip === undefined}
    content={props.tooltip}
    trigger={
      <Button
        disabled={props.disabled}
        floated={props.floated}
        color={props.color}
        loading={props.loading}
        negative={props.negative}
        circular
        basic
        size="tiny"
        icon={props.icon}
        onClick={props.onClick}
        content={props.content}
        style={props.style}
      />
    }
  />
);

export default ActionButton;
