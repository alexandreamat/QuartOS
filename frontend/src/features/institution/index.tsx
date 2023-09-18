import { useState } from "react";
import { Table, Loader, Flag, FlagNameValues, Label } from "semantic-ui-react";
import InstitutionForm from "./components/Form";
import { InstitutionApiOut, api } from "app/services/api";
import { getName } from "i18n-iso-countries";
import { logMutationError } from "utils/error";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import TableHeader from "components/TableHeader";
import TableFooter from "components/TableFooter";
import EditActionButton from "components/EditActionButton";
import ConfirmDeleteButton from "components/ConfirmDeleteButton";
import ActionButton from "components/ActionButton";
import { InstitutionLogo } from "./components/InstitutionLogo";

const InstitutionsTable = (props: {
  onOpenEditForm: (x: InstitutionApiOut) => void;
  onOpenCreateForm: () => void;
  data: InstitutionApiOut[];
}) => {
  const [deleteInstitution, deleteInstitutionResult] =
    api.endpoints.deleteApiInstitutionsInstitutionIdDelete.useMutation();
  const [syncInstitution, syncInstitutionResult] =
    api.endpoints.syncApiInstitutionsInstitutionIdSyncPut.useMutation();

  const handleDelete = async (institution: InstitutionApiOut) => {
    try {
      await deleteInstitution(institution.id).unwrap();
    } catch (error) {
      logMutationError(error, deleteInstitutionResult);
      return;
    }
  };

  const handleSync = async (institution: InstitutionApiOut) => {
    try {
      await syncInstitution(institution.id).unwrap();
    } catch (error) {
      logMutationError(error, syncInstitutionResult);
      return;
    }
  };

  return (
    <Table>
      <TableHeader
        headers={["", "Name", "Country or Region", "Website"]}
        actions={3}
      />
      <Table.Body>
        {props.data.map((institution) => (
          <Table.Row key={institution.id}>
            <Table.Cell collapsing textAlign="center">
              <InstitutionLogo institution={institution} />
            </Table.Cell>
            <Table.Cell>{institution.name}</Table.Cell>
            <Table.Cell>
              <Flag
                name={
                  institution.country_code.toLocaleLowerCase() as FlagNameValues
                }
              />
              {getName(institution.country_code, "en")}
            </Table.Cell>
            <Table.Cell>
              <Label
                as="a"
                href={institution.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {institution.url}
              </Label>
            </Table.Cell>
            <Table.Cell collapsing>
              <ActionButton
                tooltip="Sync"
                icon="sync"
                onClick={async () => await handleSync(institution)}
                disabled={false}
                loading={syncInstitutionResult.isLoading}
                negative={syncInstitutionResult.isError}
              />
            </Table.Cell>
            <Table.Cell collapsing>
              <EditActionButton
                onOpenEditForm={() => props.onOpenEditForm(institution)}
              />
            </Table.Cell>
            <Table.Cell collapsing>
              <ConfirmDeleteButton
                query={deleteInstitutionResult}
                onDelete={async () => await handleDelete(institution)}
              />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <TableFooter columns={7} onCreate={props.onOpenCreateForm} />
    </Table>
  );
};

export default function Institutions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<
    InstitutionApiOut | undefined
  >(undefined);

  const institutionsQuery = api.endpoints.readManyApiInstitutionsGet.useQuery();

  const handleOpenCreateForm = () => {
    setSelectedInstitution(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditForm = (institution: InstitutionApiOut) => {
    setSelectedInstitution(institution);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setSelectedInstitution(undefined);
    setIsModalOpen(false);
  };

  if (institutionsQuery.isLoading) return <Loader active size="huge" />;

  if (institutionsQuery.isError) console.error(institutionsQuery.originalArgs);

  return (
    <>
      {institutionsQuery.data?.length ? (
        <InstitutionsTable
          data={institutionsQuery.data}
          onOpenCreateForm={handleOpenCreateForm}
          onOpenEditForm={handleOpenEditForm}
        />
      ) : (
        <EmptyTablePlaceholder onCreate={handleOpenCreateForm} />
      )}
      <InstitutionForm
        institution={selectedInstitution}
        open={isModalOpen}
        onClose={handleClose}
      />
    </>
  );
}
