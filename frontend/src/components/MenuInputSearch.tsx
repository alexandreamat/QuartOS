import { Input, Menu } from "semantic-ui-react";
import { UseStateType } from "types";

export default function MenuInputSearch(props: {
  searchState: UseStateType<string | undefined>;
}) {
  const [search, setSearch] = props.searchState;
  return (
    <Menu.Item fitted style={{ flex: 1 }}>
      <Input
        icon="search"
        placeholder="Search..."
        value={search || ""}
        onChange={(_, data) =>
          setSearch(data.value.length ? data.value : undefined)
        }
      />
    </Menu.Item>
  );
}
