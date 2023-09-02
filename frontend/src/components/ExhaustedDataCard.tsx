import { Card } from "semantic-ui-react";

const ExhaustedDataCard = () => (
  <Card fluid>
    <Card.Content textAlign="center">
      <Card.Meta>There is no more data available.</Card.Meta>
    </Card.Content>
  </Card>
);

export default ExhaustedDataCard;
