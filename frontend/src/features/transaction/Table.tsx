import { TransactionApiIn, TransactionApiOut, api } from "app/services/api";
import { Icon, Table } from "semantic-ui-react";
import LoadableCell from "components/LoadableCell";
import EditCell from "components/EditCell";
import DeleteCell from "components/DeleteCell";
import TableHeader from "components/TableHeader";
import { renderErrorMessage } from "utils/error";
import { format } from "date-fns";
import { useAccountQueries } from "features/account/hooks";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import CurrencyLabel from "components/CurrencyLabel";

function TransactionRow(
  props:
    | {
        transaction: TransactionApiOut;
        onOpenEditForm: (transaction: TransactionApiOut) => void;
        onDelete: () => void;
      }
    | {
        transaction: TransactionApiIn;
      }
) {
  const isApiOut = "onOpenEditForm" in props;
  const accountQueries = useAccountQueries(props.transaction.account_id);

  const [deleteTransaction, deleteTransactionResult] =
    api.endpoints.deleteApiTransactionsIdDelete.useMutation();

  const handleDelete = async (transaction: TransactionApiOut) => {
    try {
      await deleteTransaction(transaction.id).unwrap();
    } catch (error) {
      console.error(deleteTransactionResult.originalArgs);
      throw error;
    }
    if (isApiOut) props.onDelete();
  };

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
        {props.transaction.datetime &&
          format(new Date(props.transaction.datetime), " yyyy MMMM d")}
      </Table.Cell>
      <Table.Cell>{props.transaction.name}</Table.Cell>
      <Table.Cell collapsing>
        <CurrencyLabel
          amount={props.transaction.amount}
          currencyCode={props.transaction.currency_code}
        />
      </Table.Cell>
      <LoadableCell
        collapsing
        isLoading={accountQueries.isLoading}
        isSuccess={accountQueries.isSuccess}
        isError={accountQueries.isError}
        error={accountQueries.error}
      >
        {accountQueries.account ? accountQueries.account.name : "UNKNOWN"}
      </LoadableCell>
      {isApiOut && (
        <>
          <EditCell
            disabled={accountQueries.account?.is_synced !== false}
            onEdit={() => props.onOpenEditForm(props.transaction)}
          />
          <DeleteCell
            disabled={accountQueries.account?.is_synced !== false}
            isLoading={deleteTransactionResult.isLoading}
            isError={deleteTransactionResult.isError}
            error={
              deleteTransactionResult.isError
                ? renderErrorMessage(deleteTransactionResult.error)
                : ""
            }
            onDelete={async () => await handleDelete(props.transaction)}
          />
        </>
      )}
    </Table.Row>
  );
}

export default function TransactionsTable(
  props:
    | {
        transactions: TransactionApiOut[];
        onOpenEditForm: (transaction: TransactionApiOut) => void;
        onDelete: () => void;
      }
    | {
        transactions: TransactionApiIn[];
      }
) {
  const isApiOut = "onOpenEditForm" in props;

  if (!props.transactions.length) return <EmptyTablePlaceholder />;

  return (
    <Table>
      <TableHeader
        headers={["", "Created", "Name", "Amount", "Account"]}
        actions={isApiOut ? 2 : 0}
      />
      <Table.Body>
        {isApiOut
          ? props.transactions.map((transaction, index) => (
              <TransactionRow
                key={index}
                transaction={transaction}
                onOpenEditForm={props.onOpenEditForm}
                onDelete={props.onDelete}
              />
            ))
          : props.transactions.map((transaction, index) => (
              <TransactionRow key={index} transaction={transaction} />
            ))}
      </Table.Body>
    </Table>
  );
}
