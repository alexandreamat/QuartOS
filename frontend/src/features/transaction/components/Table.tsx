import { TransactionApiIn, TransactionApiOut, api } from "app/services/api";
import { Checkbox, CheckboxProps, Icon, Table } from "semantic-ui-react";
import LoadableCell from "components/LoadableCell";
import EditCell from "components/EditCell";
import ConfirmDeleteButton from "components/ConfirmDeleteButton";
import TableHeader from "components/TableHeader";
import { logMutationError } from "utils/error";
import { useAccountQueries } from "features/account/hooks";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import CurrencyLabel from "components/CurrencyLabel";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import FormattedTimestamp from "components/FormattedTimestamp";

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
        onCheckedChange?: (x: boolean) => void;
      }
    | {
        transaction: TransactionApiOut | TransactionApiIn;
      }
) {
  const hasActions = "onOpenEditForm" in props;
  const hasCheckbox = hasActions && props.onCheckedChange;
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

  return (
    <Table.Row>
      <Table.Cell collapsing textAlign="center">
        {hasCheckbox && (
          <Checkbox
            // checked={true}
            onChange={(
              _: React.FormEvent<HTMLInputElement>,
              data: CheckboxProps
            ) => {
              props.onCheckedChange!(data.checked as boolean);
            }}
          />
        )}
      </Table.Cell>
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
            {/* <ActionButton
              disabled={Boolean(props.transaction.related_transaction_id)}
              icon="linkify"
              onClick={() => props.onOpenCreateForm(0, props.transaction.id)}
            /> */}
          </Table.Cell>
          <EditCell
            onOpenEditForm={() => props.onOpenEditForm(props.transaction)}
          />
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
        transactions: TransactionApiOut[];
        onOpenEditForm: (transaction: TransactionApiOut) => void;
        onOpenCreateForm: (
          accountId: number,
          relatedTransactionId: number
        ) => void;
        onMutation: () => void;
        onTransactionCheckedChange?: (
          transaction: TransactionApiOut,
          checked: boolean
        ) => void;
      }
    | {
        transactions: (TransactionApiOut | TransactionApiIn)[];
      }
) {
  const hasActions = "onOpenEditForm" in props;
  const hasCheckbox = hasActions && props.onTransactionCheckedChange;

  if (!props.transactions.length) return <EmptyTablePlaceholder />;

  return (
    <Table>
      <TableHeader
        headers={(hasCheckbox ? ["Select"] : []).concat([
          "",
          "Created",
          "Name",
          "Amount",
          "Account",
        ])}
        actions={hasActions ? 3 : 0}
      />
      <Table.Body>
        {hasActions
          ? props.transactions.map((transaction, index) => (
              <TransactionRow
                key={index}
                transaction={transaction}
                onOpenEditForm={props.onOpenEditForm}
                onOpenCreateForm={props.onOpenCreateForm}
                onDelete={props.onMutation}
                onCheckedChange={
                  props.onTransactionCheckedChange &&
                  ((checked: boolean) =>
                    props.onTransactionCheckedChange!(transaction, checked))
                }
              />
            ))
          : props.transactions.map((transaction, index) => (
              <TransactionRow key={index} transaction={transaction} />
            ))}
      </Table.Body>
    </Table>
  );
}
