import { TransactionApiIn, TransactionApiOut, api } from "app/services/api";
import { Checkbox, CheckboxProps, Icon, Popup, Table } from "semantic-ui-react";
import LoadableQuery from "components/LoadableCell";
import EditActionButton from "components/EditActionButton";
import ConfirmDeleteButton from "components/ConfirmDeleteButton";
import { logMutationError } from "utils/error";
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
        onCheckboxChange?: (x: boolean) => void;
        checked?: boolean;
      }
    | {
        transaction: TransactionApiOut | TransactionApiIn;
      }
) {
  const navigate = useNavigate();

  const hasActions = "onOpenEditForm" in props;
  const accountQueries = useAccountQueries(props.transaction.account_id);

  const [deleteTransaction, deleteTransactionResult] =
    api.endpoints.deleteApiTransactionsIdDelete.useMutation();

  const handleDelete = async (transaction: TransactionApiOut) => {
    try {
      await deleteTransaction(transaction.id).unwrap();
    } catch (error) {
      logMutationError(error, deleteTransactionResult);
      return;
    }
    if (hasActions) props.onDelete();
  };

  function handleGoToCreateMovementForm() {
    if (!hasActions) return;
    let params = new URLSearchParams();
    params.append("formMode", "create");
    params.append("transactionId", props.transaction.id.toString());
    navigate(`/movements/?${params.toString()}`);
  }

  function handleGoToEditMovementForm() {
    let params = new URLSearchParams();
    params.append("formMode", "edit");
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
                  props.transaction.movement_id
                    ? "Transaction already part of a movement"
                    : "Add to the movement"
                }
                trigger={
                  <Checkbox
                    disabled={Boolean(props.transaction.movement_id)}
                    checked={props.checked}
                    onChange={(
                      event: React.FormEvent<HTMLInputElement>,
                      data: CheckboxProps
                    ) => props.onCheckboxChange!(data.checked || false)}
                  />
                }
              />
            ) : props.transaction.movement_id ? (
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
            ) : (
              <Popup
                content="Create movement"
                trigger={
                  <div>
                    <ActionButton
                      icon="arrows alternate horizontal"
                      onClick={handleGoToCreateMovementForm}
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
          <Table.Cell collapsing>
            <ConfirmDeleteButton
              disabled={accountQueries.account?.is_synced !== false}
              query={deleteTransactionResult}
              onDelete={async () => await handleDelete(props.transaction)}
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
        ) => void;
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
              transactionPage.map((t, j) => (
                <TransactionRow
                  key={i * 20 + j}
                  transaction={t}
                  onOpenEditForm={props.onOpenEditForm}
                  onOpenCreateForm={props.onOpenCreateForm}
                  onDelete={props.onMutation}
                  onCheckboxChange={
                    props.onFlowCheckboxChange &&
                    ((c) => props.onFlowCheckboxChange!(t, c))
                  }
                  checked={props.checked?.includes(t.id)}
                />
              ))
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
