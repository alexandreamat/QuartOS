import { Icon } from "semantic-ui-react";

export function EllipsisCircle(props: { onClick: () => void }) {
  return (
    <div onClick={props.onClick} style={{ cursor: "pointer" }}>
      <Icon name="ellipsis horizontal" color="grey" />
    </div>
  );
}
