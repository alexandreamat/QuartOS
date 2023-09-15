import {
  Button,
  Checkbox,
  Menu,
  Popup,
  SemanticICONS,
} from "semantic-ui-react";
import ClickableIcon from "components/ClickableIcon";
import NumericInput from "components/DecimalInput";
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
