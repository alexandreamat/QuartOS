import {
  AccountApiOut,
  InstitutionApiOut,
  TransactionApiOut,
} from "app/services/api";
import CurrencyLabel from "components/CurrencyLabel";
import FormattedTimestamp from "components/FormattedTimestamp";
import AccountIcon from "features/account/components/Icon";
import { useAccountQueries } from "features/account/hooks";
import { Placeholder, Popup, Step } from "semantic-ui-react";
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

const AccountLogo = (props: {
  account?: AccountApiOut;
  institution?: InstitutionApiOut;
  loading?: boolean;
}) =>
  props.loading ? (
    <Placeholder>
      <Placeholder.Header image />
    </Placeholder>
  ) : (
    <Popup
      hideOnScroll
      content={props.account?.name}
      trigger={
        props.account && (
          <div>
            <AccountIcon
              account={props.account}
              institution={props.institution}
            />
          </div>
        )
      }
    />
  );

const Amount = (props: {
  transaction?: TransactionApiOut;
  currencyCode?: string;
  loading?: boolean;
}) =>
  props.loading ? (
    <CurrencyLabel.Placeholder />
  ) : (
    <Popup
      hideOnScroll
      position="top center"
      content={`Account balance: ${props.transaction?.account_balance.toLocaleString(
        undefined,
        {
          style: "currency",
          currency: props.currencyCode,
        }
      )}`}
      trigger={
        props.currencyCode &&
        props.transaction && (
          <div>
            <CurrencyLabel
              amount={props.transaction.amount}
              currencyCode={props.currencyCode}
            />
          </div>
        )
      }
    />
  );

const TransactionName = (props: {
  transaction?: TransactionApiOut;
  loading?: boolean;
}) =>
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
      content={<FormattedTimestamp timestamp={props.transaction?.timestamp} />}
      trigger={
        <div>
          <LineWithHiddenOverflow content={props.transaction?.name} />
        </div>
      }
    />
  );

interface FlowProps {
  transaction?: TransactionApiOut;
  onRemove?: () => void;
  onOpenEditForm?: () => void;
  loading?: boolean;
  style?: CSSProperties;
}

function Outflow(props: FlowProps) {
  const accountQueries = useAccountQueries(props.transaction?.account_id);

  return (
    <FlexRow
      style={{
        alignItems: "center",
        gap: flowGap,
        padding: flowPadding,
      }}
    >
      {props.onRemove && (
        <RemoveFlow onRemoveFlow={props.onRemove} loading={props.loading} />
      )}
      {props.onOpenEditForm && (
        <EditFlow
          onOpenEditForm={props.onOpenEditForm}
          loading={props.loading}
        />
      )}
      {props.transaction && props.transaction.files.length > 0 && (
        <ViewFilesButton transaction={props.transaction} />
      )}
      <AccountLogo
        account={accountQueries.account}
        institution={accountQueries.institution}
        loading={props.loading || accountQueries.isLoading}
      />
      <FlexRow.Auto>
        <TransactionName
          transaction={props.transaction}
          loading={props.loading}
        />
      </FlexRow.Auto>
      <Amount
        transaction={props.transaction}
        currencyCode={accountQueries.account?.currency_code}
        loading={props.loading || accountQueries.isLoading}
      />
    </FlexRow>
  );
}

function Inflow(props: FlowProps) {
  const accountQueries = useAccountQueries(props.transaction?.account_id);

  return (
    <FlexRow
      style={{ alignItems: "center", gap: flowGap, padding: flowPadding }}
    >
      <Amount
        transaction={props.transaction}
        currencyCode={accountQueries.account?.currency_code}
        loading={props.loading || accountQueries.isLoading}
      />
      <FlexRow.Auto>
        <TransactionName
          transaction={props.transaction}
          loading={props.loading}
        />
      </FlexRow.Auto>
      <AccountLogo
        account={accountQueries.account}
        institution={accountQueries.institution}
        loading={props.loading || accountQueries.isLoading}
      />
      {props.transaction && props.transaction.files.length > 0 && (
        <ViewFilesButton transaction={props.transaction} />
      )}
      {props.onOpenEditForm && (
        <EditFlow
          onOpenEditForm={props.onOpenEditForm}
          loading={props.loading}
        />
      )}
      {props.onRemove && (
        <RemoveFlow onRemoveFlow={props.onRemove} loading={props.loading} />
      )}
    </FlexRow>
  );
}

function StepFlows(props: {
  onRemove?: (x: TransactionApiOut) => void;
  onOpenEditForm?: (x: TransactionApiOut) => void;
  selectedAccountId?: number;
  transactions?: TransactionApiOut[];
  loading?: boolean;
  filterPredicate: (t: TransactionApiOut) => boolean;
  flowComponent: (props: FlowProps) => JSX.Element;
}) {
  const flows = props.transactions?.filter(props.filterPredicate);

  const hasFlows = flows && flows.length > 0;

  if (!props.loading && !hasFlows) return <></>;

  return (
    <Step style={{ padding: stepPadding }}>
      <Step.Content style={{ width: "100%" }}>
        {props.loading ? (
          <props.flowComponent
            loading
            onRemove={() => {}}
            onOpenEditForm={() => {}}
          />
        ) : (
          hasFlows &&
          flows.map((t) => (
            <props.flowComponent
              key={t.id}
              transaction={t}
              onRemove={props.onRemove && (() => props.onRemove!(t))}
              onOpenEditForm={
                props.onOpenEditForm && (() => props.onOpenEditForm!(t))
              }
              style={{
                fontWeight:
                  t.account_id === props.selectedAccountId ? "bold" : "normal",
              }}
            />
          ))
        )}
      </Step.Content>
    </Step>
  );
}

export function Flows(props: {
  onRemove?: (x: TransactionApiOut) => void;
  onOpenEditForm?: (x: TransactionApiOut) => void;
  selectedAccountId?: number;
  transactions?: TransactionApiOut[];
  loading?: boolean;
}) {
  return (
    <Step.Group fluid widths={2}>
      <StepFlows
        loading={props.loading}
        onOpenEditForm={props.onOpenEditForm}
        onRemove={props.onRemove}
        selectedAccountId={props.selectedAccountId}
        transactions={props.transactions}
        filterPredicate={(t) => t.amount < 0}
        flowComponent={Outflow}
      />
      <StepFlows
        loading={props.loading}
        onOpenEditForm={props.onOpenEditForm}
        onRemove={props.onRemove}
        selectedAccountId={props.selectedAccountId}
        transactions={props.transactions}
        filterPredicate={(t) => t.amount >= 0}
        flowComponent={Inflow}
      />
    </Step.Group>
  );
}
