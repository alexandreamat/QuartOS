import { useNavigate } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";
import Summary from "./Summary";
import FlexColumn from "components/FlexColumn";

export default function Detail(props: {}) {
  const navigate = useNavigate();

  return (
    <>
      <FlexColumn>
        <div>
          <Button
            icon
            labelPosition="left"
            color="blue"
            onClick={() => navigate(-1)}
          >
            <Icon name="arrow left" />
            Go back
          </Button>
        </div>
        <Summary />
        <FlexColumn.Auto>la</FlexColumn.Auto>
      </FlexColumn>
    </>
  );
}
