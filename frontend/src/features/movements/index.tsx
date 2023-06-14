import {
  AccountApiOut,
  InstitutionApiOut,
  MovementApiOut,
  TransactionApiOut,
  api,
} from "app/services/api";
import CurrencyLabel from "components/CurrencyLabel";
import FormattedTimestamp from "components/FormattedTimestamp";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { useAccountQueries } from "features/account/hooks";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import { SimpleQuery } from "interfaces";
import { Card, Grid, Icon, Loader, Placeholder, Step } from "semantic-ui-react";

function AccountName(props: { query: SimpleQuery; account?: AccountApiOut }) {
  if (props.query.isLoading)
    return (
      <Step.Content>
        <Step.Title>
          <Placeholder>
            <Placeholder.Line />
          </Placeholder>
        </Step.Title>
      </Step.Content>
    );

  if (props.query.isSuccess)
    return (
      <Step.Content>
        <Step.Title>{props.account!.name}</Step.Title>
      </Step.Content>
    );

  if (props.query.isError)
    return (
      <Step.Content>
        <Step.Title>
          <>?</>
        </Step.Title>
      </Step.Content>
    );

  return <></>;
}

function Logo(props: { query: SimpleQuery; institution?: InstitutionApiOut }) {
  if (props.query.isLoading)
    return (
      <Placeholder>
        <Placeholder.Image />
      </Placeholder>
    );

  if (props.query.isSuccess && props.institution)
    return <InstitutionLogo institution={props.institution} />;

  if (props.query.isError) return <Icon name="question" />;

  return <></>;
}

function OutFlowTransaction(props: { transaction: TransactionApiOut }) {
  const accountQueries = useAccountQueries(props.transaction.account_id);

  return (
    <>
      <CurrencyLabel
        amount={props.transaction.amount}
        currencyCode={props.transaction.currency_code}
      />
      <AccountName query={accountQueries} account={accountQueries.account} />
      <Logo query={accountQueries} institution={accountQueries.institution} />
    </>
  );
}

function InFlowTransaction(props: { transaction: TransactionApiOut }) {
  const accountQueries = useAccountQueries(props.transaction.account_id);

  return (
    <>
      <Logo query={accountQueries} institution={accountQueries.institution} />
      <AccountName query={accountQueries} account={accountQueries.account} />
      <CurrencyLabel
        amount={props.transaction.amount}
        currencyCode={props.transaction.currency_code}
      />
    </>
  );
}

function Movement(props: { movement: MovementApiOut }) {
  const transactionsQuery =
    api.endpoints.readTransactionsApiMovementsIdTransactionsGet.useQuery(
      props.movement.id
    );

  if (transactionsQuery.isLoading)
    return (
      <Placeholder>
        <Placeholder.Line />
      </Placeholder>
    );

  if (!transactionsQuery.isSuccess) return <></>;

  if (transactionsQuery.data.length === 0) return <></>;

  const firstTransaction = transactionsQuery.data[0];

  return (
    <Card fluid color="teal">
      <Card.Content>
        <Card.Header>
          <Grid columns="equal">
            <Grid.Column>{firstTransaction.name}</Grid.Column>
            <Grid.Column textAlign="right">
              {/* <ActionButton icon="pencil" onClick={() => {}} />
              <ActionButton icon="pencil" onClick={() => {}} /> */}
            </Grid.Column>
          </Grid>
        </Card.Header>
        <Card.Meta>
          <FormattedTimestamp timestamp={firstTransaction.timestamp} />
        </Card.Meta>
      </Card.Content>
      <Card.Content extra>
        <Step.Group fluid>
          <Step style={{ justifyContent: "space-between" }}>
            {transactionsQuery.data
              .filter((transaction) => transaction.amount < 0)
              .map((transaction) => (
                <OutFlowTransaction
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            {transactionsQuery.isError && <p>Error</p>}
          </Step>
          <Step style={{ justifyContent: "space-between" }}>
            {transactionsQuery.data
              .filter((transaction) => transaction.amount >= 0)
              .map((transaction) => (
                <InFlowTransaction
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            {transactionsQuery.isError && <p>Error</p>}
          </Step>
        </Step.Group>
      </Card.Content>
    </Card>
  );
}

export default function Movements() {
  const movementsQuery = api.endpoints.readManyApiMovementsGet.useQuery({});

  if (movementsQuery.isLoading) return <Loader active size="huge" />;

  if (movementsQuery.isError)
    return <QueryErrorMessage query={movementsQuery} />;

  return (
    <div style={{ height: "100%", padding: 1, overflow: "auto" }}>
      {movementsQuery.isSuccess &&
        movementsQuery.data.map((movement) => <Movement movement={movement} />)}
    </div>
  );
}
