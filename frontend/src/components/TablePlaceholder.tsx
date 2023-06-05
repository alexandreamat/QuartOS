import { Header, Icon, Segment } from "semantic-ui-react";
import CreateNewButton from "./CreateNewButton";

function EmptyTablePlaceholder(props: { onCreate?: () => void }) {
  return (
    <Segment placeholder>
      <Header icon>
        <Icon name="search" />
        No data found!
      </Header>
      {props.onCreate && (
        <Segment.Inline>
          <CreateNewButton onCreate={props.onCreate} />
        </Segment.Inline>
      )}
    </Segment>
  );
}

export default EmptyTablePlaceholder;
