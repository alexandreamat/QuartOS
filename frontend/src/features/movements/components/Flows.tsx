import {
  AccountApiOut,
  InstitutionApiOut,
  TransactionApiOut,
} from "app/services/api";
import CurrencyLabel from "components/CurrencyLabel";
import { useAccountQueries } from "features/account/hooks";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import { SimpleQuery } from "interfaces";
import {
  Grid,
  Header,
  Icon,
  Message,
  Placeholder,
  Step,
} from "semantic-ui-react";

function AccountName(props: { query: SimpleQuery; account?: AccountApiOut }) {
  if (props.query.isLoading)
    return (
      <Placeholder>
        <Placeholder.Header />
      </Placeholder>
    );

  if (props.query.isSuccess) return <Header>{props.account!.name}</Header>;

  if (props.query.isError) return <Header>?</Header>;

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
      return <InstitutionLogo size="mini" institution={props.institution} />;
    return <Icon size="big" name="credit card" />;
  }

  if (props.query.isError) return <Icon name="question" />;

  return <></>;
}

function Outflow(props: { outflow: TransactionApiOut }) {
  const accountQueries = useAccountQueries(props.outflow.account_id);

  return (
    <Grid.Row>
      <Grid.Column width={4} textAlign="center" verticalAlign="middle">
        <Logo query={accountQueries} institution={accountQueries.institution} />
      </Grid.Column>
      <Grid.Column width={8} textAlign="center" verticalAlign="middle">
        <AccountName query={accountQueries} account={accountQueries.account} />
      </Grid.Column>
      <Grid.Column width={4} textAlign="center" verticalAlign="middle">
        <CurrencyLabel
          amount={props.outflow.amount}
          currencyCode={props.outflow.currency_code}
        />
      </Grid.Column>
    </Grid.Row>
  );
}

function Inflow(props: { outflow: TransactionApiOut }) {
  const accountQueries = useAccountQueries(props.outflow.account_id);

  return (
    <Grid.Row>
      <Grid.Column width={4} textAlign="center" verticalAlign="middle">
        <CurrencyLabel
          amount={props.outflow.amount}
          currencyCode={props.outflow.currency_code}
        />
      </Grid.Column>
      <Grid.Column width={8} textAlign="center" verticalAlign="middle">
        <AccountName query={accountQueries} account={accountQueries.account} />
      </Grid.Column>
      <Grid.Column width={4} textAlign="center" verticalAlign="middle">
        <Logo query={accountQueries} institution={accountQueries.institution} />
      </Grid.Column>
    </Grid.Row>
  );
}

export function Flows(props: {
  outflows: TransactionApiOut[];
  inflows: TransactionApiOut[];
}) {
  return (
    <Step.Group fluid widths={2}>
      <Step>
        <Step.Content style={{ width: "100%" }}>
          {props.outflows.length ? (
            <Grid>
              {props.outflows.map((outflow) => (
                <Outflow key={outflow.id} outflow={outflow} />
              ))}
            </Grid>
          ) : (
            <Step.Title>Select outflows</Step.Title>
          )}
        </Step.Content>
      </Step>
      <Step style={{ justifyContent: "space-between" }}>
        <Step.Content style={{ width: "100%" }}>
          {props.inflows.length ? (
            <Grid>
              {props.inflows.map((inflow) => (
                <Inflow key={inflow.id} outflow={inflow} />
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
