import { useAccountOptions } from "features/account/hooks";
import { useState } from "react";
import {
  Button,
  Dropdown,
  DropdownProps,
  Icon,
  Input,
  InputOnChangeData,
  Menu,
} from "semantic-ui-react";
import Uploader from "./Uploader";
import { dateToString, stringToDate } from "utils/time";
import { RemoveCircle } from "features/movements/components/RemoveCircle";

export default function Bar(props: {
  accountId: number;
  onAccountIdChange: (x: number) => void;
  search: string;
  onSearchChange: (x: string) => void;
  timestamp?: Date;
  onTimestampChange: (x: Date | undefined) => void;
  isDescending: boolean;
  onToggleIsDescending: () => void;
}) {
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const handleUpload = () => {
    setIsUploaderOpen(true);
  };

  const handleCloseUploader = () => {
    setIsUploaderOpen(false);
  };

  const accountOptions = useAccountOptions();

  return (
    <Menu secondary style={{ width: "100%" }}>
      <Menu.Item>
        <Input
          icon="search"
          placeholder="Search..."
          value={props.search}
          onChange={(
            event: React.ChangeEvent<HTMLInputElement>,
            data: InputOnChangeData
          ) => props.onSearchChange(data.value as string)}
        />
      </Menu.Item>
      <Menu.Item>
        <Dropdown
          icon="filter"
          labeled
          className="icon"
          button
          placeholder="Filter by account"
          search
          selection
          value={props.accountId}
          options={accountOptions.data || []}
          onChange={(
            event: React.SyntheticEvent<HTMLElement>,
            data: DropdownProps
          ) => props.onAccountIdChange(data.value as number)}
        />
        {props.accountId !== 0 && (
          <Menu.Item fitted>
            <RemoveCircle onClick={() => props.onAccountIdChange(0)} />
          </Menu.Item>
        )}
      </Menu.Item>
      <Menu.Item>
        <Input
          type="date"
          icon="calendar"
          value={props.timestamp ? dateToString(props.timestamp) : ""}
          iconPosition="left"
          onChange={(e: React.SyntheticEvent<HTMLElement>, data: any) =>
            props.onTimestampChange(stringToDate(data.value))
          }
        />
        <Menu.Item fitted>
          <Button icon onClick={props.onToggleIsDescending}>
            <Icon
              name={props.isDescending ? "sort amount down" : "sort amount up"}
            />
          </Button>
        </Menu.Item>
        {props.timestamp && (
          <Menu.Item fitted>
            <RemoveCircle onClick={() => props.onTimestampChange(undefined)} />
          </Menu.Item>
        )}
      </Menu.Item>
      <Menu.Item position="right">
        <Button icon labelPosition="left" onClick={handleUpload}>
          <Icon name="upload" />
          Upload Transactions Sheet
        </Button>
      </Menu.Item>
      <Uploader
        open={isUploaderOpen}
        accountId={props.accountId}
        onClose={handleCloseUploader}
      />
    </Menu>
  );
}
