import {
  AccountApiOut,
  InstitutionApiOut,
  MovementApiOut,
  TransactionApiOut,
  api,
} from "app/services/api";
import ConfirmDeleteButton from "components/ConfirmDeleteButton";
import CurrencyLabel from "components/CurrencyLabel";
import FormattedTimestamp from "components/FormattedTimestamp";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { useAccountQueries } from "features/account/hooks";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import { SimpleQuery } from "interfaces";
import { Card, Grid, Icon, Loader, Placeholder, Step } from "semantic-ui-react";
import { logMutationError } from "utils/error";

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

  if (props.query.isSuccess) {
    if (props.institution)
      return <InstitutionLogo size="mini" institution={props.institution} />;
    return <Icon size="tiny" name="credit card" />;
  }

  if (props.query.isError) return <Icon name="question" />;

  return <></>;
}

function Outflow(props: { transaction: TransactionApiOut }) {
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

function Inflow(props: { transaction: TransactionApiOut }) {
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

function Flows(props: { transactions: TransactionApiOut[] }) {
  return (
    <Step.Group fluid widths={2}>
      <Step style={{ justifyContent: "space-between" }}>
        {props.transactions
          .filter((transaction) => transaction.amount < 0)
          .map((transaction) => (
            <Outflow key={transaction.id} transaction={transaction} />
          ))}
      </Step>
      <Step style={{ justifyContent: "space-between" }}>
        {props.transactions
          .filter((transaction) => transaction.amount >= 0)
          .map((transaction) => (
            <Inflow key={transaction.id} transaction={transaction} />
          ))}
      </Step>
    </Step.Group>
  );
}

function Movement(props: { movement: MovementApiOut }) {
  const transactionsQuery =
    api.endpoints.readTransactionsApiMovementsIdTransactionsGet.useQuery(
      props.movement.id
    );

  const [deleteMovement, deleteMovementResult] =
    api.endpoints.deleteApiMovementsIdDelete.useMutation();

  const handleDelete = async () => {
    try {
      await deleteMovement(props.movement.id).unwrap();
    } catch (error) {
      logMutationError(error, deleteMovementResult);
      return;
    }
  };

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
              <ConfirmDeleteButton
                query={deleteMovementResult}
                onDelete={handleDelete}
              />
            </Grid.Column>
          </Grid>
        </Card.Header>
        <Card.Meta>
          <FormattedTimestamp timestamp={firstTransaction.timestamp} />
        </Card.Meta>
      </Card.Content>
      <Card.Content extra>
        <Flows transactions={transactionsQuery.data} />
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
        movementsQuery.data.map((movement) => (
          <Movement key={movement.id} movement={movement} />
        ))}
    </div>
  );
}
