import {
  AccountApiOut,
  InstitutionApiOut,
  TransactionApiOut,
} from "app/services/api";
import CurrencyLabel from "components/CurrencyLabel";
import FormattedTimestamp from "components/FormattedTimestamp";
import AccountIcon from "features/account/components/Icon";
import { useAccountQueries } from "features/account/hooks";
import { Grid, Placeholder, Popup, Step } from "semantic-ui-react";
import { ClickableIcon } from "components/ClickableIcon";
import { CSSProperties } from "react";
import LineWithHiddenOverflow from "components/LineWithHiddenOverflow";

const flowPadding = 5;
const stepPadding = 18;

const RemoveFlow = (props: { onRemoveFlow: () => void }) => (
  <Grid.Column width={1} verticalAlign="middle">
    <ClickableIcon name="remove circle" onClick={props.onRemoveFlow} />
  </Grid.Column>
);

const EditFlow = (props: { onOpenEditForm: () => void }) => (
  <Grid.Column width={2} textAlign="center" verticalAlign="middle">
    <ClickableIcon name="ellipsis horizontal" onClick={props.onOpenEditForm} />
  </Grid.Column>
);

const AccountLogo = (props: {
  account: AccountApiOut;
  institution?: InstitutionApiOut;
}) => (
  <Grid.Column width={2} textAlign="center" verticalAlign="middle">
    <Popup
      hideOnScroll
      content={props.account.name}
      trigger={
        <div>
          <AccountIcon
            account={props.account}
            institution={props.institution}
          />
        </div>
      }
    />
  </Grid.Column>
);

const Amount = (props: {
  transaction: TransactionApiOut;
  currencyCode: string;
}) => (
  <Grid.Column width={5} textAlign="center" verticalAlign="middle">
    <Popup
      hideOnScroll
      position="top center"
      content={`Account balance: ${props.transaction.account_balance.toLocaleString(
        undefined,
        {
          style: "currency",
          currency: props.currencyCode,
        }
      )}`}
      trigger={
        <div>
          <CurrencyLabel
            amount={props.transaction.amount}
            currencyCode={props.currencyCode}
          />
        </div>
      }
    />
  </Grid.Column>
);

const TransactionName = (props: { transaction: TransactionApiOut }) => (
  <Grid.Column textAlign="center" verticalAlign="middle">
    <Popup
      hideOnScroll
      position="top center"
      content={<FormattedTimestamp timestamp={props.transaction.timestamp} />}
      trigger={
        <div>
          <LineWithHiddenOverflow content={props.transaction.name} />
        </div>
      }
    />
  </Grid.Column>
);

function Outflow(props: {
  transaction: TransactionApiOut;
  onRemove?: () => void;
  onOpenEditForm?: () => void;
  style?: CSSProperties;
}) {
  const accountQueries = useAccountQueries(props.transaction.account_id);

  if (!accountQueries.account)
    return <OutflowPlaceholder onRemove onOpenEditForm />;

  return (
    <Grid.Row columns="equal" style={{ padding: flowPadding, ...props.style }}>
      {props.onRemove && <RemoveFlow onRemoveFlow={props.onRemove} />}
      {props.onOpenEditForm && (
        <EditFlow onOpenEditForm={props.onOpenEditForm} />
      )}
      <AccountLogo
        account={accountQueries.account}
        institution={accountQueries.institution}
      />
      <TransactionName transaction={props.transaction} />
      <Amount
        transaction={props.transaction}
        currencyCode={accountQueries.account.currency_code}
      />
    </Grid.Row>
  );
}

function Inflow(props: {
  transaction: TransactionApiOut;
  onRemove?: () => void;
  onOpenEditForm?: () => void;
  style?: CSSProperties;
}) {
  const accountQueries = useAccountQueries(props.transaction.account_id);

  if (!accountQueries.account)
    return <InflowPlaceholder onRemove onOpenEditForm />;

  return (
    <Grid.Row columns="equal" style={{ padding: flowPadding, ...props.style }}>
      <Amount
        transaction={props.transaction}
        currencyCode={accountQueries.account.currency_code}
      />
      <TransactionName transaction={props.transaction} />
      <AccountLogo
        account={accountQueries.account}
        institution={accountQueries.institution}
      />
      {props.onOpenEditForm && (
        <EditFlow onOpenEditForm={props.onOpenEditForm} />
      )}
      {props.onRemove && <RemoveFlow onRemoveFlow={props.onRemove} />}
    </Grid.Row>
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
                  transaction={transaction}
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
                  transaction={transaction}
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
    <ClickableIcon.Placeholder name="remove circle" />
  </Grid.Column>
);

const EditFlowPlaceholder = () => (
  <Grid.Column width={2} textAlign="center" verticalAlign="middle">
    <ClickableIcon.Placeholder name="ellipsis horizontal" />
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
