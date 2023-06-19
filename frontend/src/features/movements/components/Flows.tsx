import { TransactionApiOut } from "app/services/api";
import CurrencyLabel from "components/CurrencyLabel";
import FormattedTimestamp from "components/FormattedTimestamp";
import LoadableQuery from "components/LoadableCell";
import AccountIcon from "features/account/components/Icon";
import { useAccountQueries } from "features/account/hooks";
import { Grid, Popup, Step } from "semantic-ui-react";
import { RemoveCircle } from "./RemoveCircle";

const flowPadding = 5;
const stepPadding = 18;

function Outflow(props: {
  flow: TransactionApiOut;
  onRemoveFlow?: () => void;
}) {
  const accountQueries = useAccountQueries(props.flow.account_id);

  return (
    <Popup
      hideOnScroll
      content={
        <>
          {props.flow.name}
          <FormattedTimestamp timestamp={props.flow.timestamp} />
        </>
      }
      trigger={
        <Grid.Row columns="equal" style={{ padding: flowPadding }}>
          {props.onRemoveFlow && (
            <Grid.Column width={1} verticalAlign="middle">
              <RemoveCircle onClick={props.onRemoveFlow} />
            </Grid.Column>
          )}
          <Grid.Column width={2} textAlign="center" verticalAlign="middle">
            <LoadableQuery query={accountQueries}>
              <AccountIcon
                account={accountQueries.account!}
                institution={accountQueries.institution!}
              />
            </LoadableQuery>
          </Grid.Column>
          <Grid.Column textAlign="center" verticalAlign="middle">
            <LoadableQuery query={accountQueries}>
              {accountQueries.account?.name}
            </LoadableQuery>
          </Grid.Column>
          <Grid.Column width={4} textAlign="center" verticalAlign="middle">
            <CurrencyLabel
              amount={props.flow.amount}
              currencyCode={props.flow.currency_code}
            />
          </Grid.Column>
        </Grid.Row>
      }
    />
  );
}

function Inflow(props: { flow: TransactionApiOut; onRemoveFlow?: () => void }) {
  const accountQueries = useAccountQueries(props.flow.account_id);

  return (
    <Popup
      hideOnScroll
      content={
        <>
          {props.flow.name}
          <FormattedTimestamp timestamp={props.flow.timestamp} />
        </>
      }
      trigger={
        <Grid.Row columns="equal" style={{ padding: flowPadding }}>
          <Grid.Column width={4} textAlign="center" verticalAlign="middle">
            <CurrencyLabel
              amount={props.flow.amount}
              currencyCode={props.flow.currency_code}
            />
          </Grid.Column>
          <Grid.Column textAlign="center" verticalAlign="middle">
            <LoadableQuery query={accountQueries}>
              {accountQueries.account?.name}
            </LoadableQuery>
          </Grid.Column>
          <Grid.Column width={2} textAlign="center" verticalAlign="middle">
            <LoadableQuery query={accountQueries}>
              <AccountIcon
                account={accountQueries.account!}
                institution={accountQueries.institution!}
              />
            </LoadableQuery>
          </Grid.Column>
          {props.onRemoveFlow && (
            <Grid.Column width={1} verticalAlign="middle">
              <RemoveCircle onClick={props.onRemoveFlow} />
            </Grid.Column>
          )}
        </Grid.Row>
      }
    />
  );
}

export function Flows(props: {
  outflows: TransactionApiOut[];
  inflows: TransactionApiOut[];
  onRemoveFlow?: (transactionId: number) => void;
}) {
  return (
    <Step.Group fluid widths={2} style={{ margin: 10 }}>
      <Step style={{ padding: stepPadding }}>
        <Step.Content style={{ width: "100%" }}>
          {props.outflows.length ? (
            <Grid>
              {props.outflows.map((transaction) => (
                <Outflow
                  key={transaction.id}
                  flow={transaction}
                  onRemoveFlow={
                    props.onRemoveFlow
                      ? () => props.onRemoveFlow!(transaction.id)
                      : undefined
                  }
                />
              ))}
            </Grid>
          ) : (
            <Step.Title>Select outflows</Step.Title>
          )}
        </Step.Content>
      </Step>
      <Step style={{ padding: stepPadding }}>
        <Step.Content style={{ width: "100%" }}>
          {props.inflows.length ? (
            <Grid>
              {props.inflows.map((transaction) => (
                <Inflow
                  key={transaction.id}
                  flow={transaction}
                  onRemoveFlow={
                    props.onRemoveFlow
                      ? () => props.onRemoveFlow!(transaction.id)
                      : undefined
                  }
                />
              ))}
            </Grid>
          ) : (
            <Step.Title>Select inflows</Step.Title>
          )}
        </Step.Content>
      </Step>
    </Step.Group>
  );
}
