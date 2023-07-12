import {
  AccountApiOut,
  InstitutionApiOut,
  TransactionApiOut,
} from "app/services/api";
import CurrencyLabel from "components/CurrencyLabel";
import FormattedTimestamp from "components/FormattedTimestamp";
import LoadableQuery from "components/LoadableCell";
import AccountIcon from "features/account/components/Icon";
import { useAccountQueries } from "features/account/hooks";
import { Grid, Popup, Step } from "semantic-ui-react";
import { RemoveCircle } from "./RemoveCircle";
import { SimpleQuery } from "interfaces";
import { EllipsisCircle } from "../../../components/EllipsisCircle";

const flowPadding = 5;
const stepPadding = 18;

const RemoveFlow = (props: { onRemoveFlow: () => void }) => (
  <Grid.Column width={1} verticalAlign="middle">
    <RemoveCircle onClick={props.onRemoveFlow} />
  </Grid.Column>
);

const EditFlow = (props: { onOpenEditForm: () => void }) => (
  <Grid.Column width={2} textAlign="center" verticalAlign="middle">
    <EllipsisCircle onClick={props.onOpenEditForm}></EllipsisCircle>
  </Grid.Column>
);

const AccountLogo = (props: {
  query: SimpleQuery;
  account: AccountApiOut;
  institution: InstitutionApiOut;
}) => (
  <Grid.Column width={2} textAlign="center" verticalAlign="middle">
    <LoadableQuery query={props.query}>
      <AccountIcon account={props.account} institution={props.institution} />
    </LoadableQuery>
  </Grid.Column>
);

const Amount = (props: { amount: number; currencyCode: string }) => (
  <Grid.Column width={5} textAlign="center" verticalAlign="middle">
    <CurrencyLabel amount={props.amount} currencyCode={props.currencyCode} />
  </Grid.Column>
);

const AccountName = (props: { query: SimpleQuery; name: string }) => (
  <Grid.Column textAlign="center" verticalAlign="middle">
    <LoadableQuery query={props.query}>{props.name}</LoadableQuery>
  </Grid.Column>
);

function Outflow(props: {
  flow: TransactionApiOut;
  onRemove?: () => void;
  onOpenEditForm?: () => void;
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
          {props.onRemove && <RemoveFlow onRemoveFlow={props.onRemove} />}
          {props.onOpenEditForm && (
            <EditFlow onOpenEditForm={props.onOpenEditForm} />
          )}
          <AccountLogo
            query={accountQueries}
            account={accountQueries.account!}
            institution={accountQueries.institution!}
          />
          <AccountName
            query={accountQueries}
            name={accountQueries.account?.name || ""}
          />
          <Amount
            amount={props.flow.amount}
            currencyCode={props.flow.currency_code}
          />
        </Grid.Row>
      }
    />
  );
}

function Inflow(props: {
  flow: TransactionApiOut;
  onRemove?: () => void;
  onOpenEditForm?: () => void;
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
          <Amount
            amount={props.flow.amount}
            currencyCode={props.flow.currency_code}
          />
          <AccountName
            query={accountQueries}
            name={accountQueries.account?.name || ""}
          />
          <AccountLogo
            query={accountQueries}
            account={accountQueries.account!}
            institution={accountQueries.institution!}
          />
          {props.onOpenEditForm && (
            <EditFlow onOpenEditForm={props.onOpenEditForm} />
          )}
          {props.onRemove && <RemoveFlow onRemoveFlow={props.onRemove} />}
        </Grid.Row>
      }
    />
  );
}

export function Flows(props: {
  transactions: TransactionApiOut[];
  onRemove?: (x: TransactionApiOut) => void;
  onOpenEditForm?: (x: TransactionApiOut) => void;
}) {
  const outflows = props.transactions.filter((t) => t.amount < 0) || [];
  const inflows = props.transactions.filter((t) => t.amount >= 0) || [];
  return (
    <Step.Group fluid widths={2}>
      {outflows.length !== 0 && (
        <Step style={{ padding: stepPadding }}>
          <Step.Content style={{ width: "100%" }}>
            <Grid>
              {outflows.map((transaction) => (
                <Outflow
                  key={transaction.id}
                  flow={transaction}
                  onRemove={
                    props.onRemove && (() => props.onRemove!(transaction))
                  }
                  onOpenEditForm={
                    props.onOpenEditForm &&
                    (() => props.onOpenEditForm!(transaction))
                  }
                />
              ))}
            </Grid>
          </Step.Content>
        </Step>
      )}
      {inflows.length !== 0 && (
        <Step style={{ padding: stepPadding }}>
          <Step.Content style={{ width: "100%" }}>
            <Grid>
              {inflows.map((transaction) => (
                <Inflow
                  key={transaction.id}
                  flow={transaction}
                  onRemove={
                    props.onRemove
                      ? () => props.onRemove!(transaction)
                      : undefined
                  }
                  onOpenEditForm={
                    props.onOpenEditForm &&
                    (() => props.onOpenEditForm!(transaction))
                  }
                />
              ))}
            </Grid>
          </Step.Content>
        </Step>
      )}
    </Step.Group>
  );
}
