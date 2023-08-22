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
import { Grid, Placeholder, Popup, Step } from "semantic-ui-react";
import { RemoveCircle } from "./RemoveCircle";
import { SimpleQuery } from "interfaces";
import { EllipsisCircle } from "../../../components/EllipsisCircle";
import { CSSProperties } from "react";

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

const TransactionName = (props: { name: string }) => (
  <Grid.Column textAlign="center" verticalAlign="middle">
    {props.name}
  </Grid.Column>
);

function Outflow(props: {
  flow: TransactionApiOut;
  onRemove?: () => void;
  onOpenEditForm?: () => void;
  style?: CSSProperties;
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
        <Grid.Row
          columns="equal"
          style={{ padding: flowPadding, ...props.style }}
        >
          {props.onRemove && <RemoveFlow onRemoveFlow={props.onRemove} />}
          {props.onOpenEditForm && (
            <EditFlow onOpenEditForm={props.onOpenEditForm} />
          )}
          <AccountLogo
            query={accountQueries}
            account={accountQueries.account!}
            institution={accountQueries.institution!}
          />
          <TransactionName name={props.flow.name} />
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
  style?: CSSProperties;
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
        <Grid.Row
          columns="equal"
          style={{ padding: flowPadding, ...props.style }}
        >
          <Amount
            amount={props.flow.amount}
            currencyCode={props.flow.currency_code}
          />
          <TransactionName name={props.flow.name} />
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
  selectedAccountId?: number;
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
                  style={{
                    fontWeight:
                      transaction.account_id === props.selectedAccountId
                        ? "bold"
                        : "normal",
                  }}
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
                  style={{
                    fontWeight:
                      transaction.account_id === props.selectedAccountId
                        ? "bold"
                        : "normal",
                  }}
                />
              ))}
            </Grid>
          </Step.Content>
        </Step>
      )}
    </Step.Group>
  );
}

const RemoveFlowPlaceholder = () => (
  <Grid.Column width={1} verticalAlign="middle">
    <RemoveCircle.Placeholder />
  </Grid.Column>
);

const EditFlowPlaceholder = () => (
  <Grid.Column width={2} textAlign="center" verticalAlign="middle">
    <EllipsisCircle.Placeholder />
  </Grid.Column>
);

const AccountLogoPlaceholder = () => (
  <Grid.Column width={2} textAlign="center" verticalAlign="middle">
    <Placeholder>
      <Placeholder.Header image />
    </Placeholder>
  </Grid.Column>
);

const AmountPlaceholder = () => (
  <Grid.Column width={5} textAlign="center" verticalAlign="middle">
    <CurrencyLabel.Placeholder />
  </Grid.Column>
);

const TransactionNamePlaceholder = () => (
  <Grid.Column textAlign="center" verticalAlign="middle">
    <Placeholder>
      <Placeholder.Header>
        <Placeholder.Line />
      </Placeholder.Header>
    </Placeholder>
  </Grid.Column>
);

function OutflowPlaceholder(props: {
  onRemove?: boolean;
  onOpenEditForm?: boolean;
}) {
  return (
    <Grid.Row columns="equal" style={{ padding: flowPadding }}>
      {props.onRemove && <RemoveFlow.Placeholder />}
      {props.onOpenEditForm && <EditFlow.Placeholder />}
      <AccountLogo.Placeholder />
      <TransactionName.Placeholder />
      <Amount.Placeholder />
    </Grid.Row>
  );
}

function InflowPlaceholder(props: {
  onRemove?: boolean;
  onOpenEditForm?: boolean;
}) {
  return (
    <Grid.Row columns="equal" style={{ padding: flowPadding }}>
      <Amount.Placeholder />
      <TransactionName.Placeholder />
      <AccountLogo.Placeholder />
      {props.onOpenEditForm && <EditFlow.Placeholder />}
      {props.onRemove && <RemoveFlow.Placeholder />}
    </Grid.Row>
  );
}

function FlowsPlaceholder(props: {
  onRemove?: boolean;
  onOpenEditForm?: boolean;
}) {
  return (
    <Step.Group fluid widths={2}>
      <Step style={{ padding: stepPadding }}>
        <Step.Content style={{ width: "100%" }}>
          <Grid>
            <Outflow.Placeholder
              onRemove={props.onRemove}
              onOpenEditForm={props.onOpenEditForm}
            />
          </Grid>
        </Step.Content>
      </Step>
      <Step style={{ padding: stepPadding }}>
        <Step.Content style={{ width: "100%" }}>
          <Grid>
            <Inflow.Placeholder
              onRemove={props.onRemove}
              onOpenEditForm={props.onOpenEditForm}
            />
          </Grid>
        </Step.Content>
      </Step>
    </Step.Group>
  );
}

RemoveFlow.Placeholder = RemoveFlowPlaceholder;
EditFlow.Placeholder = EditFlowPlaceholder;
AccountLogo.Placeholder = AccountLogoPlaceholder;
Amount.Placeholder = AmountPlaceholder;
TransactionName.Placeholder = TransactionNamePlaceholder;
Outflow.Placeholder = OutflowPlaceholder;
Inflow.Placeholder = InflowPlaceholder;
Flows.Placeholder = FlowsPlaceholder;
