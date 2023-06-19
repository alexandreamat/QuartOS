import {
  AccountApiOut,
  InstitutionApiOut,
  TransactionApiOut,
} from "app/services/api";
import CurrencyLabel from "components/CurrencyLabel";
import FormattedTimestamp from "components/FormattedTimestamp";
import { useAccountQueries } from "features/account/hooks";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import { SimpleQuery } from "interfaces";
import { Grid, Icon, Placeholder, Popup, Step } from "semantic-ui-react";

const flowPadding = 5;
const stepPadding = 18;

function AccountName(props: { query: SimpleQuery; account?: AccountApiOut }) {
  if (props.query.isLoading)
    return (
      <Placeholder>
        <Placeholder.Header />
      </Placeholder>
    );

  if (props.query.isSuccess) return <p>{props.account!.name}</p>;

  if (props.query.isError) return <p>?</p>;

  return <></>;
}

function Logo(props: { query: SimpleQuery; institution?: InstitutionApiOut }) {
  if (props.query.isLoading)
    return (
      <Placeholder>
        <Placeholder.Image />
      </Placeholder>
    );

  if (props.query.isSuccess) {
    if (props.institution)
      return <InstitutionLogo height={26} institution={props.institution} />;
    return <Icon size="big" name="credit card" />;
  }

  if (props.query.isError) return <Icon name="question" />;

  return <></>;
}

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
              <div onClick={props.onRemoveFlow} style={{ cursor: "pointer" }}>
                <Icon name="remove circle" color="grey" />
              </div>
            </Grid.Column>
          )}
          <Grid.Column width={2} textAlign="center" verticalAlign="middle">
            <Logo
              query={accountQueries}
              institution={accountQueries.institution}
            />
          </Grid.Column>
          <Grid.Column textAlign="center" verticalAlign="middle">
            <AccountName
              query={accountQueries}
              account={accountQueries.account}
            />
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
            <AccountName
              query={accountQueries}
              account={accountQueries.account}
            />
          </Grid.Column>
          <Grid.Column width={2} textAlign="center" verticalAlign="middle">
            <Logo
              query={accountQueries}
              institution={accountQueries.institution}
            />
          </Grid.Column>
          {props.onRemoveFlow && (
            <Grid.Column width={1} verticalAlign="middle">
              <div onClick={props.onRemoveFlow} style={{ cursor: "pointer" }}>
                <Icon name="remove circle" color="grey" />
              </div>
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
