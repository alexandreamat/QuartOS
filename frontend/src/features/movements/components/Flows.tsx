import { TransactionApiOut } from "app/services/api";
import CurrencyLabel from "components/CurrencyLabel";
import FormattedTimestamp from "components/FormattedTimestamp";
import AccountIcon from "features/account/components/Icon";
import { useAccountQueries } from "features/account/hooks";
import { Popup, Step } from "semantic-ui-react";
import ClickableIcon from "components/ClickableIcon";
import { CSSProperties, useState } from "react";
import LineWithHiddenOverflow from "components/LineWithHiddenOverflow";
import ModalFileViewer from "features/transaction/components/ModalFileViewer";
import FlexRow from "components/FlexRow";
import TransactionForm from "features/transaction/components/Form";

const flowPadding = "5px 15px 5px 15px";
const flowGap = "10px";
const stepPadding = "10px";

function Flow(props: {
  transaction?: TransactionApiOut;
  onRemove?: () => void;
  loading?: boolean;
  style?: CSSProperties;
  reverse?: boolean;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [fileOpen, setFileOpen] = useState(false);

  const accountQueries = useAccountQueries(props.transaction?.account_id);

  const currencyCode = accountQueries.account?.currency_code;

  const children = [
    () => (
      <Popup
        disabled={!props.loading && !accountQueries.isLoading}
        hideOnScroll
        position="top center"
        content={
          props.transaction &&
          currencyCode &&
          `Account balance: ${props.transaction.account_balance.toLocaleString(
            undefined,
            {
              style: "currency",
              currency: currencyCode,
            },
          )}`
        }
        trigger={
          <div>
            <CurrencyLabel
              amount={props.transaction?.amount}
              currencyCode={currencyCode}
              loading={props.loading || accountQueries.isLoading}
            />
          </div>
        }
      />
    ),
    () => (
      <FlexRow.Auto>
        <Popup
          hideOnScroll
          position="top center"
          content={
            <FormattedTimestamp timestamp={props.transaction?.timestamp} />
          }
          trigger={
            <div>
              <LineWithHiddenOverflow
                content={props.transaction?.name}
                loading={props.loading}
                style={props.style}
              />
            </div>
          }
        />
      </FlexRow.Auto>
    ),
    () => (
      <Popup
        disabled={!props.loading && !accountQueries.isLoading}
        hideOnScroll
        content={accountQueries.account?.name}
        trigger={
          <div>
            <AccountIcon
              account={accountQueries.account}
              institution={accountQueries.institution}
              loading={props.loading || accountQueries.isLoading}
            />
          </div>
        }
      />
    ),
    props.transaction &&
      props.transaction.files.length > 0 &&
      (() => (
        <ClickableIcon
          name="file"
          onClick={() => setFileOpen(true)}
          loading={props.loading}
        />
      )),
    () => (
      <ClickableIcon
        name="ellipsis horizontal"
        onClick={() => setFormOpen(true)}
        loading={props.loading}
      />
    ),
    props.onRemove &&
      (() => (
        <ClickableIcon
          name="remove circle"
          onClick={props.onRemove}
          loading={props.loading}
        />
      )),
  ];

  return (
    <FlexRow
      style={{ alignItems: "center", gap: flowGap, padding: flowPadding }}
    >
      {fileOpen && props.transaction && (
        <ModalFileViewer
          transaction={props.transaction}
          onClose={() => setFileOpen(false)}
        />
      )}
      {formOpen && props.transaction && (
        <TransactionForm.Edit
          open
          onClose={() => setFormOpen(false)}
          movementId={props.transaction.movement_id}
          transaction={props.transaction}
        />
      )}
      {(props.reverse ? children : children.reverse()).map(
        (Child, i) => Child && <Child key={i} />,
      )}
    </FlexRow>
  );
}

function StepFlows(props: {
  onRemove?: (x: TransactionApiOut) => void;
  selectedAccountId?: number;
  transactions?: TransactionApiOut[];
  loading?: boolean;
  filterPredicate: (t: TransactionApiOut) => boolean;
  reverse?: boolean;
}) {
  const flows = props.transactions?.filter(props.filterPredicate);

  const hasFlows = flows && flows.length > 0;

  if (!props.loading && !hasFlows) return <></>;

  return (
    <Step style={{ padding: stepPadding }}>
      <Step.Content style={{ width: "100%" }}>
        {props.loading ? (
          <Flow loading onRemove={() => {}} reverse={props.reverse} />
        ) : (
          hasFlows &&
          flows.map((t) => (
            <Flow
              key={t.id}
              transaction={t}
              onRemove={() => props.onRemove && props.onRemove(t)}
              style={{
                fontWeight:
                  t.account_id === props.selectedAccountId ? "bold" : "normal",
              }}
              reverse={props.reverse}
            />
          ))
        )}
      </Step.Content>
    </Step>
  );
}

export function Flows(props: {
  onRemove?: (x: TransactionApiOut) => void;
  selectedAccountId?: number;
  transactions?: TransactionApiOut[];
  loading?: boolean;
}) {
  return (
    <Step.Group fluid widths={2}>
      <StepFlows
        loading={props.loading}
        onRemove={props.onRemove}
        selectedAccountId={props.selectedAccountId}
        transactions={props.transactions}
        filterPredicate={(t) => t.amount < 0}
      />
      <StepFlows
        loading={props.loading}
        onRemove={props.onRemove}
        selectedAccountId={props.selectedAccountId}
        transactions={props.transactions}
        filterPredicate={(t) => t.amount >= 0}
        reverse
      />
    </Step.Group>
  );
}
