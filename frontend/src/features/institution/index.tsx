import { useState } from "react";
import { Table, Loader, Flag, FlagNameValues, Label } from "semantic-ui-react";
import InstitutionForm from "./Form";
import { InstitutionApiOut, api } from "app/services/api";
import { getName } from "i18n-iso-countries";
import { logMutationError, renderErrorMessage } from "utils/error";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import TableHeader from "components/TableHeader";
import TableFooter from "components/TableFooter";
import EditCell from "components/EditCell";
import DeleteCell from "components/DeleteCell";

export default function Institutions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<
    InstitutionApiOut | undefined
  >(undefined);

  const institutionsQuery = api.endpoints.readManyApiInstitutionsGet.useQuery();
  const [deleteInstitution, deleteInstitutionResult] =
    api.endpoints.deleteApiInstitutionsIdDelete.useMutation();

  const handleCreate = () => {
    setSelectedInstitution(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (institution: InstitutionApiOut) => {
    setSelectedInstitution(institution);
    setIsModalOpen(true);
  };

  const handleDelete = async (institution: InstitutionApiOut) => {
    try {
      await deleteInstitution(institution.id).unwrap();
    } catch (error) {
      logMutationError(error, deleteInstitutionResult);
      return;
    }
  };

  const handleClose = () => {
    setSelectedInstitution(undefined);
    setIsModalOpen(false);
  };

  if (institutionsQuery.isLoading) return <Loader active size="huge" />;

  if (institutionsQuery.isError) console.error(institutionsQuery.originalArgs);

  const InstitutionsTable = (props: { data: InstitutionApiOut[] }) => (
    <Table>
      <TableHeader
        headers={["Name", "Country or Region", "Website"]}
        actions={2}
      />
      <Table.Body>
        {props.data.map((institution) => (
          <Table.Row key={institution.id}>
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
            <EditCell onEdit={() => handleEdit(institution)} />
            <DeleteCell
              isError={deleteInstitutionResult.isError}
              isLoading={deleteInstitutionResult.isLoading}
              error={
                deleteInstitutionResult.isError
                  ? renderErrorMessage(deleteInstitutionResult.error)
                  : ""
              }
              onDelete={async () => await handleDelete(institution)}
            />
          </Table.Row>
        ))}
      </Table.Body>
      <TableFooter columns={5} onCreate={handleCreate} />
    </Table>
  );

  return (
    <>
      {institutionsQuery.data?.length ? (
        <InstitutionsTable data={institutionsQuery.data} />
      ) : (
        <EmptyTablePlaceholder onCreate={handleCreate} />
      )}
      <InstitutionForm
        institution={selectedInstitution}
        open={isModalOpen}
        onClose={handleClose}
      />
    </>
  );
}
