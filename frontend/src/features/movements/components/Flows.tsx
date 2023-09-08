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
import ModalFileViewer from "features/transaction/components/ModalFileViewer";
import FlexRow from "components/FlexRow";

const flowPadding = "5px 15px 5px 15px";
const flowGap = "10px";
const stepPadding = "10px";

const RemoveFlow = (
  props: { onRemoveFlow: () => void; loading?: false } | { loading: true }
) =>
  props.loading ? (
    <ClickableIcon.Placeholder name="remove circle" />
  ) : (
    <ClickableIcon name="remove circle" onClick={props.onRemoveFlow} />
  );

const EditFlow = (
  props: { onOpenEditForm: () => void; loading?: false } | { loading: true }
) =>
  props.loading ? (
    <ClickableIcon.Placeholder name="ellipsis horizontal" />
  ) : (
    <ClickableIcon name="ellipsis horizontal" onClick={props.onOpenEditForm} />
  );

const ViewFilesButton = (props: { transaction: TransactionApiOut }) => (
  <ModalFileViewer
    transaction={props.transaction}
    trigger={<ClickableIcon name="file" />}
  />
);

const AccountLogo = (
  props:
    | {
        account: AccountApiOut;
        institution?: InstitutionApiOut;
        loading?: false;
      }
    | { loading: true }
) =>
  props.loading ? (
    <Placeholder>
      <Placeholder.Header image />
    </Placeholder>
  ) : (
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
  );

const Amount = (
  props:
    | {
        transaction: TransactionApiOut;
        currencyCode: string;
        loading?: false;
      }
    | { loading: true }
) =>
  props.loading ? (
    <CurrencyLabel.Placeholder />
  ) : (
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
  );

const TransactionName = (
  props: { transaction: TransactionApiOut; loading?: false } | { loading: true }
) =>
  props.loading ? (
    <Placeholder>
      <Placeholder.Header>
        <Placeholder.Line />
      </Placeholder.Header>
    </Placeholder>
  ) : (
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
  );

function Outflow(
  props:
    | {
        transaction: TransactionApiOut;
        onRemove?: () => void;
        onOpenEditForm?: () => void;
        style?: CSSProperties;
        loading?: false;
      }
    | {
        onRemove?: boolean;
        onOpenEditForm?: boolean;
        loading: true;
      }
) {
  const accountQueries = useAccountQueries(
    !props.loading ? props.transaction.account_id : undefined
  );

  if (props.loading || !accountQueries.account)
    return (
      <FlexRow>
        {props.onRemove && <RemoveFlow loading />}
        {props.onOpenEditForm && <EditFlow loading />}
        <AccountLogo loading />
        <TransactionName loading />
        <Amount loading />
      </FlexRow>
    );

  return (
    <FlexRow
      style={{
        alignItems: "center",
        gap: flowGap,
        padding: flowPadding,
      }}
    >
      {props.onRemove && <RemoveFlow onRemoveFlow={props.onRemove} />}
      {props.onOpenEditForm && (
        <EditFlow onOpenEditForm={props.onOpenEditForm} />
      )}
      {props.transaction.files.length > 0 && (
        <ViewFilesButton transaction={props.transaction} />
      )}
      <AccountLogo
        account={accountQueries.account}
        institution={accountQueries.institution}
      />
      <FlexRow.Auto>
        <TransactionName transaction={props.transaction} />
      </FlexRow.Auto>
      <Amount
        transaction={props.transaction}
        currencyCode={accountQueries.account.currency_code}
      />
    </FlexRow>
  );
}

function Inflow(
  props:
    | {
        transaction: TransactionApiOut;
        onRemove?: () => void;
        onOpenEditForm?: () => void;
        style?: CSSProperties;
        loading?: false;
      }
    | {
        onRemove?: boolean;
        onOpenEditForm?: boolean;
        loading: true;
      }
) {
  const accountQueries = useAccountQueries(
    props.loading ? undefined : props.transaction.account_id
  );

  if (!accountQueries.account || props.loading)
    return (
      <FlexRow>
        <Amount loading />
        <TransactionName loading />
        <AccountLogo loading />
        {props.onOpenEditForm && <EditFlow loading />}
        {props.onRemove && <RemoveFlow loading />}
      </FlexRow>
    );

  return (
    <FlexRow
      style={{ alignItems: "center", gap: flowGap, padding: flowPadding }}
    >
      <Amount
        transaction={props.transaction}
        currencyCode={accountQueries.account.currency_code}
      />
      <FlexRow.Auto>
        <TransactionName transaction={props.transaction} />
      </FlexRow.Auto>
      <AccountLogo
        account={accountQueries.account}
        institution={accountQueries.institution}
      />
      {props.transaction.files.length > 0 && (
        <ViewFilesButton transaction={props.transaction} />
      )}
      {props.onOpenEditForm && (
        <EditFlow onOpenEditForm={props.onOpenEditForm} />
      )}
      {props.onRemove && <RemoveFlow onRemoveFlow={props.onRemove} />}
    </FlexRow>
  );
}

export function Flows(
  props:
    | {
        transactions: TransactionApiOut[];
        onRemove?: (x: TransactionApiOut) => void;
        onOpenEditForm?: (x: TransactionApiOut) => void;
        selectedAccountId?: number;
        loading?: false;
      }
    | {
        onRemove?: boolean;
        onOpenEditForm?: boolean;
        loading: true;
      }
) {
  if (props.loading)
    return (
      <Step.Group fluid widths={2}>
        <Step style={{ padding: stepPadding }}>
          <Step.Content style={{ width: "100%" }}>
            <Grid>
              <Outflow loading />
            </Grid>
          </Step.Content>
        </Step>
        <Step style={{ padding: stepPadding }}>
          <Step.Content style={{ width: "100%" }}>
            <Grid>
              <Inflow loading />
            </Grid>
          </Step.Content>
        </Step>
      </Step.Group>
    );

  const outflows = props.transactions.filter((t) => t.amount < 0) || [];
  const inflows = props.transactions.filter((t) => t.amount >= 0) || [];
  return (
    <Step.Group fluid widths={2}>
      {outflows.length !== 0 && (
        <Step style={{ padding: stepPadding }}>
          <Step.Content style={{ width: "100%" }}>
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
          </Step.Content>
        </Step>
      )}
      {inflows.length !== 0 && (
        <Step style={{ padding: stepPadding }}>
          <Step.Content style={{ width: "100%" }}>
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
          </Step.Content>
        </Step>
      )}
    </Step.Group>
  );
}
