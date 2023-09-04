import { Input, InputOnChangeData, Menu } from "semantic-ui-react";

export default function MenuInputSearch(props: {
  search: string;
  onSearchChange: (x: string) => void;
}) {
  return (
    <Menu.Item fitted style={{ flex: 1 }}>
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
  );
}
