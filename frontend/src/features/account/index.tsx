import { useEffect, useState } from "react";
import {
  Table,
  Loader,
  Flag,
  FlagNameValues,
  Message,
} from "semantic-ui-react";
import AccountForm from "./Form";
import { AccountApiOut, InstitutionApiOut, api } from "app/services/api";
import { renderErrorMessage } from "utils/error";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import TableHeader from "components/TableHeader";
import EditCell from "components/EditCell";
import DeleteCell from "components/DeleteCell";
import LoadableCell from "components/LoadableCell";
import { useLocation } from "react-router-dom";
import ActionButton from "components/ActionButton";
import { useInstitutionLinkQueries } from "features/institutionlink/hooks";
import TableFooter from "components/TableFooter";

function InstitutionCell(props: { institution: InstitutionApiOut }) {
  return (
    <>
      <Flag
        name={
          props.institution.country_code.toLocaleLowerCase() as FlagNameValues
        }
      />
      {props.institution.name}
    </>
  );
}

function AccountRow(props: { account: AccountApiOut; onEdit: () => void }) {
  const institutionLinkQueries = useInstitutionLinkQueries(
    props.account.institutionalaccount?.user_institution_link_id
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

  return (
    <Table.Row key={props.account.id}>
      <Table.Cell>{props.account.name}</Table.Cell>
      <Table.Cell>
        {props.account.institutionalaccount && (
          <>**** {props.account.institutionalaccount.mask}</>
        )}
      </Table.Cell>
      <Table.Cell>
        {props.account.institutionalaccount &&
          props.account.institutionalaccount.type}
        {props.account.noninstitutionalaccount &&
          props.account.noninstitutionalaccount.type}
      </Table.Cell>
      <Table.Cell>{props.account.currency_code}</Table.Cell>
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
          content="Upload Transactions"
          onClick={() => {}}
          disabled={props.account.is_synced !== false}
          icon="upload"
        />
      </Table.Cell>
      <EditCell
        disabled={props.account.is_synced !== false}
        onEdit={props.onEdit}
      />
      <DeleteCell
        disabled={props.account.is_synced !== false}
        isError={deleteAccountResult.isError}
        isLoading={deleteAccountResult.isLoading}
        error={
          deleteAccountResult.isError
            ? renderErrorMessage(deleteAccountResult.error)
            : ""
        }
        onDelete={async () => await handleDelete(props.account)}
      />
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
        headers={["Name", "Number", "Type", "Currency", "Institution"]}
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<
    AccountApiOut | undefined
  >(undefined);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const modalParam = params.get("modal") === "true";

  useEffect(() => {
    setIsModalOpen(modalParam);
  }, [modalParam]);

  const accountsQuery = api.endpoints.readManyApiAccountsGet.useQuery();

  const handleCreate = () => {
    setSelectedAccount(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (account: AccountApiOut) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setSelectedAccount(undefined);
    setIsModalOpen(false);
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
        open={isModalOpen}
        onClose={handleClose}
      />
    </>
  );
}
