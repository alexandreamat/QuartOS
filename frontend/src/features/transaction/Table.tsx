import { TransactionApiIn, TransactionApiOut, api } from "app/services/api";
import { Icon, Table } from "semantic-ui-react";
import LoadableCell from "components/LoadableCell";
import EditCell from "components/EditCell";
import DeleteCell from "components/DeleteCell";
import TableHeader from "components/TableHeader";
import { logMutationError } from "utils/error";
import { format } from "date-fns";
import { useAccountQueries } from "features/account/hooks";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import CurrencyLabel from "components/CurrencyLabel";
import ActionButton from "components/ActionButton";
import { InstitutionLogo } from "features/institution/InstitutionLogo";

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
      logMutationError(error, deleteTransactionResult);
      return;
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
        {props.transaction.timestamp &&
          format(new Date(props.transaction.timestamp), " yyyy MMMM d")}
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
        {accountQueries.institution && (
          <InstitutionLogo institution={accountQueries.institution} />
        )}{" "}
        {accountQueries.account?.name}
      </LoadableCell>
      {isApiOut && (
        <>
          <Table.Cell collapsing>
            <ActionButton
              disabled={Boolean(props.transaction.related_transaction_id)}
              icon="linkify"
              onClick={() => props.onOpenCreateForm(0, props.transaction.id)}
            />
          </Table.Cell>
          <EditCell
            disabled={accountQueries.account?.is_synced !== false}
            onOpenEditForm={() => props.onOpenEditForm(props.transaction)}
          />
          <DeleteCell
            disabled={accountQueries.account?.is_synced !== false}
            query={deleteTransactionResult}
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
        onOpenCreateForm: (
          accountId: number,
          relatedTransactionId: number
        ) => void;
        onMutation: () => void;
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
        actions={isApiOut ? 3 : 0}
      />
      <Table.Body>
        {isApiOut
          ? props.transactions.map((transaction, index) => (
              <TransactionRow
                key={index}
                transaction={transaction}
                onOpenEditForm={props.onOpenEditForm}
                onOpenCreateForm={props.onOpenCreateForm}
                onDelete={props.onMutation}
              />
            ))
          : props.transactions.map((transaction, index) => (
              <TransactionRow key={index} transaction={transaction} />
            ))}
      </Table.Body>
    </Table>
  );
}
