// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
import FlexColumn from "components/FlexColumn";

const InstitutionsTable = (props: {
  onOpenEditForm: (x: InstitutionApiOut) => void;
  onOpenCreateForm: () => void;
  data: InstitutionApiOut[];
}) => {
  const [deleteInstitution, deleteInstitutionResult] =
    api.endpoints.deleteInstitutionsInstitutionIdDelete.useMutation();
  const [syncInstitution, syncInstitutionResult] =
    api.endpoints.syncInstitutionsInstitutionIdSyncPut.useMutation();

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

  const institutionsQuery = api.endpoints.readManyInstitutionsGet.useQuery();

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
    <FlexColumn>
      <FlexColumn.Auto>
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
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
