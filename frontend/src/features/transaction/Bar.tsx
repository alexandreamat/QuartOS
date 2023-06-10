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

export default function Bar(props: {
  onOpenCreateForm: (x: number) => void;
  accountId: number;
  onAccountIdChange: (x: number) => void;
  search: string;
  onSearchChange: (x: string) => void;
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
    <Menu secondary>
      <Menu.Item>
        <Button
          icon
          labelPosition="left"
          primary
          onClick={() => props.onOpenCreateForm(props.accountId)}
        >
          <Icon name="plus" />
          Add
        </Button>
      </Menu.Item>
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
      </Menu.Item>
      {props.accountId !== 0 && (
        <Menu.Item fitted onClick={() => props.onAccountIdChange(0)}>
          <Icon name="close" />
        </Menu.Item>
      )}
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
