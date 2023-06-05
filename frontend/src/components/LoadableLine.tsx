import { ReactNode } from "react";
import { Placeholder } from "semantic-ui-react";

export default function LoadableLine(props: {
  isLoading: boolean;
  children: ReactNode;
}) {
  if (props.isLoading)
    return (
      <Placeholder>
        <Placeholder.Line />
      </Placeholder>
    );
  return <>{props.children}</>;
}
