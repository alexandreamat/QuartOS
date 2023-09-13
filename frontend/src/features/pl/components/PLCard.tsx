import { PlStatement } from "app/services/api";
import ActionButton from "components/ActionButton";
import CurrencyLabel from "components/CurrencyLabel";
import FlexRow from "components/FlexRow";
import Inline from "components/Inline";
import { addDays, format } from "date-fns";
import { Card, Header, Label, Placeholder, Step } from "semantic-ui-react";

export default function PLCard(props: {
  aggregate: PlStatement;
  showIncome?: boolean;
  onGoToDetail?: () => void;
  onClickIncome?: () => void;
  onClickExpenses?: () => void;
}) {
  const startDate = new Date(props.aggregate.start_date);
  const endDate = new Date(props.aggregate.end_date);
  const today = new Date();
  const isOngoing = startDate <= today && today <= endDate;

  return (
    <Card fluid color="teal">
      <Card.Content>
        <Card.Header>
          <FlexRow style={{ justifyContent: "space-between" }}>
            {format(new Date(props.aggregate.start_date), "MMMM yyyy")}
            {props.onGoToDetail && (
              <ActionButton
                onClick={props.onGoToDetail}
                icon="file alternate outline"
                content="See Report"
              />
            )}
          </FlexRow>
        </Card.Header>
        <Card.Meta>
          {`From ${startDate.toLocaleDateString()} to ${addDays(
            endDate,
            -1
          ).toLocaleDateString()}`}
          {isOngoing && (
            <Label
              color="teal"
              style={{ marginLeft: "0.5rem", verticalAlign: "middle" }}
            >
              Ongoing
            </Label>
          )}
        </Card.Meta>
        <Step.Group fluid widths={3}>
          <Step
            onClick={props.onClickIncome}
            active={props.showIncome !== undefined ? props.showIncome : false}
          >
            <Step.Title>Income</Step.Title>
            <Step.Content>
              <CurrencyLabel
                amount={props.aggregate.income}
                currencyCode={props.aggregate.currency_code}
              />
            </Step.Content>
          </Step>
          <Step
            onClick={props.onClickExpenses}
            active={props.showIncome !== undefined ? !props.showIncome : false}
          >
            <Step.Title>Expenses</Step.Title>
            <Step.Content>
              <CurrencyLabel
                amount={props.aggregate.expenses}
                currencyCode={props.aggregate.currency_code}
              />
            </Step.Content>
          </Step>
        </Step.Group>
      </Card.Content>
      <Card.Content extra>
        <FlexRow style={{ justifyContent: "right" }}>
          <Header as="h5">
            Net Income:
            <CurrencyLabel
              amount={props.aggregate.expenses + props.aggregate.income}
              currencyCode={props.aggregate.currency_code}
            />
          </Header>
        </FlexRow>
      </Card.Content>
    </Card>
  );
}

function PLCardPlaceholder(props: { onGoToDetail?: boolean }) {
  return (
    <Card fluid color="teal">
      <Card.Content>
        <Card.Header>
          <FlexRow style={{ justifyContent: "space-between" }}>
            <Placeholder style={{ width: "100%" }}>
              <Placeholder.Line />
            </Placeholder>
            {props.onGoToDetail && (
              <ActionButton
                icon="file alternate outline"
                content="See Report"
                loading
              />
            )}
          </FlexRow>
        </Card.Header>
        <Card.Meta>
          <Placeholder>
            <Placeholder.Line />
          </Placeholder>
        </Card.Meta>
        <Step.Group fluid widths={3}>
          <Step>
            <Step.Title>Income</Step.Title>
            <Step.Content>
              <CurrencyLabel loading />
            </Step.Content>
          </Step>
          <Step>
            <Step.Title>Expenses</Step.Title>
            <Step.Content>
              <CurrencyLabel loading />
            </Step.Content>
          </Step>
        </Step.Group>
      </Card.Content>
      <Card.Content extra>
        <Inline justifyContent="right">
          <Header as="h5">
            Net Income:
            <CurrencyLabel loading />
          </Header>
        </Inline>
      </Card.Content>
    </Card>
  );
}

PLCard.Placeholder = PLCardPlaceholder;
