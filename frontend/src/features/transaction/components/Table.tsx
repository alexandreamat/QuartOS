import { TransactionApiIn, TransactionApiOut, api } from "app/services/api";
import { Icon, Popup, Table } from "semantic-ui-react";
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
        onAddFlow?: () => void;
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
    if (props.onAddFlow) {
      props.onAddFlow();
    } else {
      navigate(
        `/movements/?formMode=create&transactionId=${props.transaction.id}`
      );
    }
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
            <ActionButton
              disabled={Boolean(props.transaction.movement_id)}
              icon="linkify"
              onClick={handleGoToCreateMovementForm}
            />
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
        onAddFlow?: (x: TransactionApiOut) => void;
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
              transactionPage.map((transaction, j) => (
                <TransactionRow
                  key={i * 20 + j}
                  transaction={transaction}
                  onOpenEditForm={props.onOpenEditForm}
                  onOpenCreateForm={props.onOpenCreateForm}
                  onDelete={props.onMutation}
                  onAddFlow={
                    props.onAddFlow && (() => props.onAddFlow!(transaction))
                  }
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
