import { useState } from "react";
import { Table, Loader, Message, Icon } from "semantic-ui-react";
import AccountForm from "./Form";
import { AccountApiOut, InstitutionApiOut, api } from "app/services/api";
import { renderErrorMessage } from "utils/error";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import TableHeader from "components/TableHeader";
import EditActionButton from "components/EditActionButton";
import ConfirmDeleteButton from "components/ConfirmDeleteButton";
import LoadableCell from "components/LoadableCell";
import { useLocation } from "react-router-dom";
import ActionButton from "components/ActionButton";
import { useInstitutionLinkQueries } from "features/institutionlink/hooks";
import TableFooter from "components/TableFooter";
import { capitaliseFirstLetter } from "utils/string";
import CurrencyLabel from "components/CurrencyLabel";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import { accountTypeToIconName } from "./utils";

function InstitutionCell(props: { institution: InstitutionApiOut }) {
  return (
    <>
      <InstitutionLogo institution={props.institution} />{" "}
      {props.institution.name}
    </>
  );
}

function AccountRow(props: { account: AccountApiOut; onEdit: () => void }) {
  const institutionLinkQueries = useInstitutionLinkQueries(
    props.account.institutionalaccount?.userinstitutionlink_id
  );

  const [deleteAccount, deleteAccountResult] =
    api.endpoints.deleteApiAccountsIdDelete.useMutation();

  const handleDelete = async (account: AccountApiOut) => {
    try {
      await deleteAccount(account.id).unwrap();
    } catch (error) {
      console.error(deleteAccountResult.originalArgs);
      throw error;
    }
  };

  const type = props.account.institutionalaccount
    ? props.account.institutionalaccount.type
    : props.account.noninstitutionalaccount!.type;

  return (
    <Table.Row key={props.account.id}>
      <Table.Cell>{props.account.name}</Table.Cell>
      <Table.Cell>
        <CurrencyLabel
          amount={props.account.balance}
          currencyCode={props.account.currency_code}
        />
      </Table.Cell>
      <Table.Cell>
        <Icon name={accountTypeToIconName(type)} />{" "}
        {capitaliseFirstLetter(type)}
      </Table.Cell>
      <Table.Cell>
        {props.account.institutionalaccount && (
          <>**** {props.account.institutionalaccount.mask}</>
        )}
      </Table.Cell>
      <LoadableCell
        isLoading={institutionLinkQueries.isLoading}
        isSuccess={institutionLinkQueries.isSuccess}
        isError={institutionLinkQueries.isError}
        error={institutionLinkQueries.error}
      >
        <InstitutionCell institution={institutionLinkQueries.institution!} />
      </LoadableCell>
      <Table.Cell collapsing>
        <ActionButton
          onClick={() => {}}
          disabled={props.account.is_synced !== false}
          icon="upload"
        />
      </Table.Cell>
      <Table.Cell collapsing>
        <EditActionButton
          disabled={props.account.is_synced !== false}
          onOpenEditForm={props.onEdit}
        />
      </Table.Cell>
      <Table.Cell collapsing>
        <ConfirmDeleteButton
          disabled={props.account.is_synced !== false}
          query={deleteAccountResult}
          onDelete={async () => await handleDelete(props.account)}
        />
      </Table.Cell>
    </Table.Row>
  );
}

function AccountsTable(props: {
  data: AccountApiOut[];
  onEdit: (account: AccountApiOut) => void;
  onCreate: () => void;
}) {
  if (!props.data.length)
    return <EmptyTablePlaceholder onCreate={props.onCreate} />;

  return (
    <Table>
      <TableHeader
        headers={["Name", "Balance", "Type", "Number", "Institution"]}
        actions={3}
      />
      <Table.Body>
        {props.data.map((account, index) => (
          <AccountRow
            key={index}
            account={account}
            onEdit={() => props.onEdit(account)}
          />
        ))}
      </Table.Body>
      <TableFooter columns={8} onCreate={props.onCreate} />
    </Table>
  );
}

export default function Accounts() {
  const [selectedAccount, setSelectedAccount] = useState<
    AccountApiOut | undefined
  >(undefined);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isFormOpenParam = params.get("isFormOpen") === "true";

  const [isFormOpen, setIsFormOpen] = useState(isFormOpenParam);

  const accountsQuery = api.endpoints.readManyApiAccountsGet.useQuery();

  const handleCreate = () => {
    setSelectedAccount(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (account: AccountApiOut) => {
    setSelectedAccount(account);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setSelectedAccount(undefined);
    setIsFormOpen(false);
  };

  if (accountsQuery.isLoading) return <Loader active size="huge" />;

  if (accountsQuery.isError) console.error(accountsQuery.originalArgs);

  return (
    <>
      {accountsQuery.isError && (
        <Message
          negative
          header="An error has occurred!"
          content={renderErrorMessage(accountsQuery.error)}
          icon="attention"
        />
      )}
      {accountsQuery.isSuccess && (
        <AccountsTable
          data={accountsQuery.data}
          onEdit={handleEdit}
          onCreate={handleCreate}
        />
      )}
      <AccountForm
        account={selectedAccount}
        open={isFormOpen}
        onClose={handleClose}
      />
    </>
  );
}
