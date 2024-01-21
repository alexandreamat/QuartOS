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

import { SemanticFLOATS } from "semantic-ui-react";
import ActionButton from "./ActionButton";

export default function MutateActionButton(props: {
  onOpenEditForm: () => void;
  disabled?: boolean;
  negative?: boolean;
  loading?: boolean;
  floated?: SemanticFLOATS;
  content?: string;
}) {
  return (
    <ActionButton
      floated={props.floated}
      tooltip="More"
      negative={props.negative}
      loading={props.loading}
      disabled={props.disabled}
      icon="ellipsis horizontal"
      onClick={() => props.onOpenEditForm()}
      content={props.content}
    />
  );
}
