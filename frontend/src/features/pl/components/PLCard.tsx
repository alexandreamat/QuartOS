import { PlStatement } from "app/services/api";
import ActionButton from "components/ActionButton";
import CurrencyLabel from "components/CurrencyLabel";
import FlexRow from "components/FlexRow";
import { addDays, format } from "date-fns";
import { Card, Header, Label, Placeholder, Step } from "semantic-ui-react";
import { stringToDate } from "utils/time";

export default function PLCard(props: {
  aggregate?: PlStatement;
  showIncome?: boolean;
  onGoToDetail?: () => void;
  onClickIncome?: () => void;
  onClickExpenses?: () => void;
  loading?: boolean;
}) {
  const startDate = props.aggregate && stringToDate(props.aggregate.start_date);
  const endDate = props.aggregate && stringToDate(props.aggregate.end_date);
  const today = new Date();
  const isOngoing =
    startDate && endDate && startDate <= today && today <= endDate;

  return (
    <Card fluid color="teal">
      <Card.Content>
        <Card.Header>
          <FlexRow justifyContent="space-between">
            {props.loading ? (
              <Placeholder style={{ width: "100%" }}>
                <Placeholder.Line />
              </Placeholder>
            ) : (
              startDate && format(startDate, "MMMM yyyy")
            )}
            {props.onGoToDetail && (
              <ActionButton
                onClick={props.onGoToDetail}
                icon="file alternate outline"
                content="See Report"
                loading={props.loading}
              />
            )}
          </FlexRow>
        </Card.Header>
        <Card.Meta>
          {props.loading ? (
            <Placeholder>
              <Placeholder.Line />
            </Placeholder>
          ) : (
            startDate &&
            endDate &&
            `From ${startDate.toLocaleDateString()} to ${addDays(
              endDate,
              -1,
            ).toLocaleDateString()}`
          )}
          {isOngoing && (
            <Label
              color="teal"
              style={{ marginLeft: "0.5rem", verticalAlign: "middle" }}
            >
              Ongoing
            </Label>
          )}
        </Card.Meta>
        <Step.Group fluid widths={2}>
          <Step
            onClick={props.onClickIncome}
            active={props.showIncome !== undefined ? props.showIncome : false}
          >
            <Step.Title>Income</Step.Title>
            <Step.Content>
              <CurrencyLabel
                amount={props.aggregate?.income}
                currencyCode={props.aggregate?.currency_code}
                loading={props.loading}
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
                amount={props.aggregate?.expenses}
                currencyCode={props.aggregate?.currency_code}
                loading={props.loading}
              />
            </Step.Content>
          </Step>
        </Step.Group>
      </Card.Content>
      <Card.Content extra>
        <FlexRow justifyContent="right">
          <Header as="h5">
            Net Income:
            <CurrencyLabel
              amount={
                props.aggregate &&
                props.aggregate.expenses + props.aggregate.income
              }
              currencyCode={props.aggregate?.currency_code}
              loading={props.loading}
            />
          </Header>
        </FlexRow>
      </Card.Content>
    </Card>
  );
}
