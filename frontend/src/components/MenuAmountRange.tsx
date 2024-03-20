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

import ClickableIcon from "components/ClickableIcon";
import NumericInput from "components/DecimalInput";
import {
  Button,
  Checkbox,
  Menu,
  Popup,
  SemanticICONS,
} from "semantic-ui-react";
import { UseStateType } from "types";

export default function MenuNumericRange(props: {
  valueGeState: UseStateType<number | undefined>;
  valueLeState: UseStateType<number | undefined>;
  isAbsState?: UseStateType<boolean>;
  icon: SemanticICONS;
  decimal?: boolean;
  signed?: boolean;
}) {
  const [valueGe, setvalueGe] = props.valueGeState;
  const [valueLe, setValueLe] = props.valueLeState;
  const [isAbs, setIsAbs] = props.isAbsState || [];

  return (
    <Menu.Item fitted>
      <Popup
        trigger={<Button icon={props.icon} />}
        hoverable
        position="bottom right"
        on="click"
      >
        <Menu vertical secondary fluid>
          <Menu.Item fitted>
            <NumericInput
              label=">="
              placeholder="From"
              decimal={props.decimal}
              signed={props.signed}
              valueState={props.valueGeState}
            />
          </Menu.Item>
          <Menu.Item fitted>
            <NumericInput
              label="<="
              placeholder="To"
              decimal={props.decimal}
              signed={props.signed}
              valueState={props.valueLeState}
            />
          </Menu.Item>
          {setIsAbs && (
            <Menu.Item fitted>
              <Checkbox
                label="Ignore sign"
                checked={isAbs}
                onChange={(_, data) => setIsAbs(data.checked || false)}
              />
            </Menu.Item>
          )}
        </Menu>
      </Popup>
      {(valueGe !== undefined || valueLe !== undefined) && (
        <Menu.Item fitted>
          <ClickableIcon
            name="remove circle"
            onClick={() => {
              setvalueGe(undefined);
              setValueLe(undefined);
            }}
          />
        </Menu.Item>
      )}
    </Menu.Item>
  );
}
