import { TransactionApiIn, TransactionApiOut, api } from "app/services/api";
import { Checkbox, CheckboxProps, Icon, Popup, Table } from "semantic-ui-react";
import LoadableQuery from "components/LoadableCell";
import EditActionButton from "components/EditActionButton";
import { useAccountQueries } from "features/account/hooks";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import CurrencyLabel from "components/CurrencyLabel";
import FormattedTimestamp from "components/FormattedTimestamp";
import ActionButton from "components/ActionButton";
import { useNavigate } from "react-router-dom";
import AccountIcon from "features/account/components/Icon";
import { FormattedCurrency } from "components/FormattedCurrency";

function TransactionRow(
  props:
    | {
        transaction: TransactionApiOut;
        onOpenEditForm: (transaction: TransactionApiOut) => void;
        onOpenCreateForm: (
          accountId: number,
          relatedTransactionId: number
        ) => void;
        onDelete: () => void;
        onCheckboxChange?: (x: boolean) => Promise<void>;
        checkBoxDisabled?: boolean;
        checked?: boolean;
      }
    | {
        transaction: TransactionApiOut | TransactionApiIn;
      }
) {
  const navigate = useNavigate();

  const hasActions = "onOpenEditForm" in props;
  const accountQueries = useAccountQueries(props.transaction.account_id);

  function handleGoToEditMovementForm() {
    let params = new URLSearchParams();
    params.append("isFormOpen", "true");
    params.append("movementId", props.transaction.movement_id!.toString());
    navigate(`/movements/?${params.toString()}`);
  }

  return (
    <Table.Row>
      <Table.Cell textAlign="center" collapsing>
        {props.transaction.payment_channel === "online" && (
          <Icon name="cloud" color="grey" />
        )}
        {props.transaction.payment_channel === "in store" && (
          <Icon name="shop" color="grey" />
        )}
        {props.transaction.payment_channel === "other" && (
          <Icon name="ellipsis horizontal" color="grey" />
        )}
      </Table.Cell>
      <Table.Cell collapsing>
        <FormattedTimestamp timestamp={props.transaction.timestamp} />
      </Table.Cell>
      <Table.Cell>{props.transaction.name}</Table.Cell>
      <Table.Cell collapsing>
        <Popup
          disabled={!hasActions}
          position="left center"
          content={
            <p>
              Account balance:
              <FormattedCurrency
                amount={props.transaction.account_balance || 0}
                currencyCode={props.transaction.currency_code}
              />
            </p>
          }
          trigger={
            <div>
              <CurrencyLabel
                amount={props.transaction.amount}
                currencyCode={props.transaction.currency_code}
              />
            </div>
          }
        />
      </Table.Cell>
      <Table.Cell collapsing textAlign="center">
        <LoadableQuery query={accountQueries}>
          <AccountIcon
            account={accountQueries.account!}
            institution={accountQueries.institution}
          />
        </LoadableQuery>
      </Table.Cell>
      <Table.Cell collapsing>
        <LoadableQuery query={accountQueries}>
          {accountQueries.account?.name}
        </LoadableQuery>
      </Table.Cell>
      {hasActions && (
        <>
          <Table.Cell collapsing>
            {props.onCheckboxChange ? (
              <Popup
                content={
                  props.checked
                    ? "Remove from the movement"
                    : "Add to the movement"
                }
                trigger={
                  <Checkbox
                    disabled={props.checkBoxDisabled}
                    checked={props.checked}
                    onChange={async (_: unknown, data: CheckboxProps) =>
                      await props.onCheckboxChange!(data.checked || false)
                    }
                  />
                }
              />
            ) : (
              <Popup
                content="Edit Movement"
                trigger={
                  <div>
                    <ActionButton
                      color="grey"
                      icon="arrows alternate horizontal"
                      onClick={handleGoToEditMovementForm}
                    />
                  </div>
                }
              />
            )}
          </Table.Cell>
          <Table.Cell collapsing>
            <EditActionButton
              onOpenEditForm={() => props.onOpenEditForm(props.transaction)}
            />
          </Table.Cell>
        </>
      )}
    </Table.Row>
  );
}

export default function TransactionsTable(
  props:
    | {
        transactionPages: TransactionApiOut[][];
        onOpenEditForm: (transaction: TransactionApiOut) => void;
        onOpenCreateForm: (
          accountId: number,
          relatedTransactionId: number
        ) => void;
        onMutation: () => void;
        onFlowCheckboxChange?: (
          flow: TransactionApiOut,
          checked: boolean
        ) => Promise<void>;
        checked?: number[];
      }
    | {
        transactionPages: (TransactionApiOut | TransactionApiIn)[][];
      }
) {
  const hasActions = "onOpenEditForm" in props;

  if (!props.transactionPages.length) return <EmptyTablePlaceholder />;

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell key={1} />
          <Table.HeaderCell key={2}>Created</Table.HeaderCell>
          <Table.HeaderCell key={3}>Name</Table.HeaderCell>
          <Table.HeaderCell key={4}>Amount</Table.HeaderCell>
          <Table.HeaderCell key={5} colSpan={2}>
            Account
          </Table.HeaderCell>
          <Table.HeaderCell key="actions" colSpan={3}>
            Actions
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {hasActions
          ? props.transactionPages.map((transactionPage, i) =>
              transactionPage.map((t, j) => {
                const checked = props.checked?.includes(t.id);
                return (
                  <TransactionRow
                    key={i * 20 + j}
                    transaction={t}
                    onOpenEditForm={props.onOpenEditForm}
                    onOpenCreateForm={props.onOpenCreateForm}
                    onDelete={props.onMutation}
                    onCheckboxChange={
                      props.onFlowCheckboxChange &&
                      (async (c) => await props.onFlowCheckboxChange!(t, c))
                    }
                    checked={checked}
                    checkBoxDisabled={checked && props.checked?.length === 1}
                  />
                );
              })
            )
          : props.transactionPages.map((transactionPage, i) =>
              transactionPage.map((transaction, j) => (
                <TransactionRow key={i * 20 + j} transaction={transaction} />
              ))
            )}
      </Table.Body>
    </Table>
  );
}
