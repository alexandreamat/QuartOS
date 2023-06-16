import { useState } from "react";
import { Table, Loader, Label } from "semantic-ui-react";
import InstitutionLinkForm from "./components/Form";
import { UserInstitutionLinkApiOut, api } from "app/services/api";
import { logMutationError } from "utils/error";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import ActionButton from "components/ActionButton";
import LoadableLine from "components/LoadableLine";
import TableHeader from "components/TableHeader";
import TableFooter from "components/TableFooter";
import EditActionButton from "components/EditActionButton";
import ConfirmDeleteButton from "components/ConfirmDeleteButton";
import { useNavigate } from "react-router-dom";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";

function InstitutionLinkRow(props: {
  institutionLink: UserInstitutionLinkApiOut;
  onOpenEditForm: (userInstitutionLink: UserInstitutionLinkApiOut) => void;
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
      logMutationError(error, deleteInstitutionLinkResult);
      return;
    }
  };
  const handleSync = async (userInstitutionLink: UserInstitutionLinkApiOut) => {
    try {
      await syncLink(userInstitutionLink.id).unwrap();
    } catch (error) {
      logMutationError(error, syncLinkResult);
      return;
    }
  };
  const institutionQuery = api.endpoints.readApiInstitutionsIdGet.useQuery(
    props.institutionLink.institution_id
  );

  return (
    <Table.Row key={props.institutionLink.id}>
      <Table.Cell collapsing>
        <LoadableLine isLoading={institutionQuery.isLoading}>
          {institutionQuery.data && (
            <InstitutionLogo institution={institutionQuery.data} />
          )}
        </LoadableLine>
      </Table.Cell>
      <Table.Cell>
        <LoadableLine isLoading={institutionQuery.isLoading}>
          {/* {institutionQuery.data && (
            <Flag
              name={
                institutionQuery.data?.country_code.toLocaleLowerCase() as FlagNameValues
              }
            />
          )} */}
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
          onClick={async () => await handleSync(props.institutionLink)}
        />
      </Table.Cell>
      <Table.Cell collapsing>
        <ActionButton
          disabled={props.institutionLink.is_synced}
          icon="credit card"
          content="Add"
          onClick={() =>
            navigate(
              `/accounts?isFormOpen=true&institutionLinkId=${props.institutionLink.id}`
            )
          }
        />
      </Table.Cell>
      <Table.Cell collapsing>
        <EditActionButton
          disabled={props.institutionLink.is_synced}
          onOpenEditForm={() => props.onOpenEditForm(props.institutionLink)}
        />
      </Table.Cell>
      <Table.Cell collapsing>
        <ConfirmDeleteButton
          query={deleteInstitutionLinkResult}
          onDelete={async () => await handleDelete(props.institutionLink)}
          confirmContent={
            "All associated account and transaction data WILL BE LOST. Are you sure?"
          }
        />
      </Table.Cell>
    </Table.Row>
  );
}

const InstitutionLinksTable = (props: {
  institutionLinks: UserInstitutionLinkApiOut[];
  onOpenEditForm: (institutionLink: UserInstitutionLinkApiOut) => void;
  onOpenCreateForm: () => void;
}) => {
  if (!props.institutionLinks.length)
    return <EmptyTablePlaceholder onCreate={props.onOpenCreateForm} />;

  return (
    <Table>
      <TableHeader headers={["", "Institution", "Website"]} actions={4} />
      <Table.Body>
        {props.institutionLinks.map((institutionLink) => (
          <InstitutionLinkRow
            institutionLink={institutionLink}
            onOpenEditForm={props.onOpenEditForm}
          />
        ))}
      </Table.Body>
      <TableFooter columns={7} onCreate={props.onOpenCreateForm} />
    </Table>
  );
};

export default function InstitutionsLinks() {
  const [isFormOpen, setIsModalOpen] = useState(false);
  const [selectedInstitutionLink, setSelectedInstitutionLink] = useState<
    UserInstitutionLinkApiOut | undefined
  >(undefined);

  const institutionsLinksQuery =
    api.endpoints.readManyApiInstitutionLinksGet.useQuery();

  const handleOpenCreateForm = () => {
    setSelectedInstitutionLink(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditForm = (institutionLink: UserInstitutionLinkApiOut) => {
    setSelectedInstitutionLink(institutionLink);
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedInstitutionLink(undefined);
    setIsModalOpen(false);
  };

  if (institutionsLinksQuery.isLoading) return <Loader active size="huge" />;

  return (
    <>
      <QueryErrorMessage query={institutionsLinksQuery} />
      <InstitutionLinksTable
        onOpenCreateForm={handleOpenCreateForm}
        onOpenEditForm={handleOpenEditForm}
        institutionLinks={institutionsLinksQuery.data || []}
      />
      <InstitutionLinkForm
        institutionLink={selectedInstitutionLink}
        open={isFormOpen}
        onClose={handleCloseForm}
      />
    </>
  );
}
