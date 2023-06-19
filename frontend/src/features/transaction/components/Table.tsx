import { TransactionApiIn, TransactionApiOut, api } from "app/services/api";
import { Icon, Table } from "semantic-ui-react";
import LoadableCell from "components/LoadableCell";
import EditActionButton from "components/EditActionButton";
import ConfirmDeleteButton from "components/ConfirmDeleteButton";
import TableHeader from "components/TableHeader";
import { logMutationError } from "utils/error";
import { useAccountQueries } from "features/account/hooks";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import CurrencyLabel from "components/CurrencyLabel";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import FormattedTimestamp from "components/FormattedTimestamp";
import ActionButton from "components/ActionButton";
import { useLocation, useNavigate } from "react-router-dom";

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
        transaction: TransactionApiOut | TransactionApiIn;
      }
) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

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

  function handleGoToCreateMovementForm(transaction: TransactionApiOut) {
    var transactionIds = params.get("transactionIds")?.split(",").map(Number);
    const transactionIdsSet = new Set(transactionIds).add(transaction.id);
    transactionIds = Array.from(transactionIdsSet);
    navigate(
      `/movements/?isFormOpen=true&transactionIds=${transactionIds.join(",")}`
    );
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
      {hasActions && (
        <>
          <Table.Cell collapsing>
            <ActionButton
              disabled={Boolean(props.transaction.movement_id)}
              icon="linkify"
              onClick={() => handleGoToCreateMovementForm(props.transaction)}
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
      }
    | {
        transactionPages: (TransactionApiOut | TransactionApiIn)[][];
      }
) {
  const hasActions = "onOpenEditForm" in props;

  if (!props.transactionPages.length) return <EmptyTablePlaceholder />;

  return (
    <Table>
      <TableHeader
        headers={["", "Created", "Name", "Amount", "Account"]}
        actions={hasActions ? 3 : 0}
      />
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
