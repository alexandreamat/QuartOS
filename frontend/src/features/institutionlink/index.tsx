import { useState } from "react";
import { Table, Loader, Flag, FlagNameValues, Label } from "semantic-ui-react";
import InstitutionLinkForm from "./Form";
import { UserInstitutionLinkApiOut, api } from "app/services/api";
import { renderErrorMessage } from "utils/error";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import ActionButton from "components/ActionButton";
import LoadableLine from "components/LoadableLine";
import TableHeader from "components/TableHeader";
import TableFooter from "components/TableFooter";
import EditCell from "components/EditCell";
import DeleteCell from "components/DeleteCell";
import { useNavigate } from "react-router-dom";

function InstitutionLinkRow(props: {
  institutionLink: UserInstitutionLinkApiOut;
  onEdit: (userInstitutionLink: UserInstitutionLinkApiOut) => void;
}) {
  const navigate = useNavigate();

  const [syncLink, syncLinkResult] =
    api.endpoints.syncApiInstitutionLinksIdSyncPost.useMutation();
  const [deleteInstitutionLink, deleteInstitutionLinkResult] =
    api.endpoints.deleteApiInstitutionLinksIdDelete.useMutation();

  const handleDelete = async (institutionLink: UserInstitutionLinkApiOut) => {
    try {
      await deleteInstitutionLink(institutionLink.id).unwrap();
    } catch (error) {
      console.error(deleteInstitutionLinkResult.originalArgs);
      throw error;
    }
  };
  const handleSync = async (userInstitutionLink: UserInstitutionLinkApiOut) => {
    try {
      await syncLink(userInstitutionLink.id).unwrap();
    } catch (error) {
      console.error(error);
      console.error(syncLinkResult.error);
      return;
    }
  };
  const institutionQuery = api.endpoints.readApiInstitutionsIdGet.useQuery(
    props.institutionLink.institution_id
  );
  return (
    <Table.Row key={props.institutionLink.id}>
      <Table.Cell>
        <LoadableLine isLoading={institutionQuery.isLoading}>
          {institutionQuery.data && (
            <Flag
              name={
                institutionQuery.data?.country_code.toLocaleLowerCase() as FlagNameValues
              }
            />
          )}
          {institutionQuery.data?.name}
        </LoadableLine>
      </Table.Cell>
      <Table.Cell>
        <LoadableLine isLoading={institutionQuery.isLoading}>
          {institutionQuery.data?.url && (
            <Label
              as="a"
              href={institutionQuery.data.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {institutionQuery.data.url}
            </Label>
          )}
        </LoadableLine>
      </Table.Cell>
      <Table.Cell collapsing>
        <ActionButton
          disabled={!props.institutionLink.is_synced}
          loading={syncLinkResult.isLoading}
          icon="sync"
          content="Sync"
          onClick={async () => await handleSync(props.institutionLink)}
        />
      </Table.Cell>
      <Table.Cell collapsing>
        <ActionButton
          disabled={props.institutionLink.is_synced}
          icon="credit card"
          content="Add Accounts"
          onClick={() =>
            navigate(
              `/accounts?modal=true&institutionLinkId=${props.institutionLink.id}`
            )
          }
        />
      </Table.Cell>
      <EditCell
        disabled={props.institutionLink.is_synced}
        onEdit={() => props.onEdit(props.institutionLink)}
      />
      <DeleteCell
        isLoading={deleteInstitutionLinkResult.isLoading}
        isError={deleteInstitutionLinkResult.isError}
        error={
          deleteInstitutionLinkResult.isError
            ? renderErrorMessage(deleteInstitutionLinkResult.error)
            : ""
        }
        onDelete={async () => await handleDelete(props.institutionLink)}
        confirmContent={
          "All associated account and transaction data WILL BE LOST. Are you sure?"
        }
      />
    </Table.Row>
  );
}

export default function InstitutionsLinks() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstitutionLink, setSelectedInstitutionLink] = useState<
    UserInstitutionLinkApiOut | undefined
  >(undefined);

  const institutionsLinksQuery =
    api.endpoints.readManyApiInstitutionLinksGet.useQuery();

  const handleCreate = () => {
    setSelectedInstitutionLink(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (institutionLink: UserInstitutionLinkApiOut) => {
    setSelectedInstitutionLink(institutionLink);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setSelectedInstitutionLink(undefined);
    setIsModalOpen(false);
  };

  if (institutionsLinksQuery.isLoading) return <Loader active size="huge" />;

  if (institutionsLinksQuery.isError)
    console.error(institutionsLinksQuery.originalArgs);

  const InstitutionLinksTable = (props: {
    data: UserInstitutionLinkApiOut[];
  }) => (
    <Table>
      <TableHeader headers={["Institution", "Website"]} actions={4} />
      <Table.Body>
        {props.data.map((institutionLink) => (
          <InstitutionLinkRow
            institutionLink={institutionLink}
            onEdit={handleEdit}
          />
        ))}
      </Table.Body>
      <TableFooter columns={6} onCreate={handleCreate} />
    </Table>
  );

  return (
    <>
      {institutionsLinksQuery.data?.length ? (
        <InstitutionLinksTable data={institutionsLinksQuery.data} />
      ) : (
        <EmptyTablePlaceholder onCreate={handleCreate} />
      )}
      <InstitutionLinkForm
        institutionLink={selectedInstitutionLink}
        open={isModalOpen}
        onClose={handleClose}
      />
    </>
  );
}
