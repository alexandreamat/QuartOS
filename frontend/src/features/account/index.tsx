import { useState } from "react";
import { Table, Loader, Message, Icon } from "semantic-ui-react";
import AccountForm from "./components/Form";
import { AccountApiOut, api } from "app/services/api";
import { renderErrorMessage } from "utils/error";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import EditActionButton from "components/EditActionButton";
import ConfirmDeleteButton from "components/ConfirmDeleteButton";
import LoadableQuery from "components/LoadableCell";
import { useLocation } from "react-router-dom";
import ActionButton from "components/ActionButton";
import { useInstitutionLinkQueries } from "features/institutionlink/hooks";
import TableFooter from "components/TableFooter";
import { capitaliseFirstLetter } from "utils/string";
import CurrencyLabel from "components/CurrencyLabel";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import { accountTypeToIconName } from "./utils";

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
      <Table.Cell collapsing>
        <Icon name={accountTypeToIconName(type)} />
      </Table.Cell>
      <Table.Cell>{capitaliseFirstLetter(type)}</Table.Cell>
      <Table.Cell>
        {props.account.institutionalaccount && (
          <>**** {props.account.institutionalaccount.mask}</>
        )}
      </Table.Cell>
      <Table.Cell collapsing>
        <LoadableQuery query={institutionLinkQueries}>
          <InstitutionLogo institution={institutionLinkQueries.institution!} />
        </LoadableQuery>
      </Table.Cell>
      <Table.Cell>
        <LoadableQuery query={institutionLinkQueries}>
          {institutionLinkQueries.institution?.name}
        </LoadableQuery>
      </Table.Cell>
      <Table.Cell collapsing>
        <ActionButton
          tooltip="upload"
          onClick={() => {}}
          disabled={true}
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
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell key={1}>Name</Table.HeaderCell>
          <Table.HeaderCell key={2}>Balance</Table.HeaderCell>
          <Table.HeaderCell key={3} colSpan={2}>
            Type
          </Table.HeaderCell>
          <Table.HeaderCell key={4}>Number</Table.HeaderCell>
          <Table.HeaderCell key={5} colSpan={2}>
            Institution
          </Table.HeaderCell>
          <Table.HeaderCell key="actions" colSpan={3}>
            Actions
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
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
