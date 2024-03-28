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

import { UserInstitutionLinkApiOut, api } from "app/services/api";
import ActionButton from "components/ActionButton";
import LoadableLine from "components/LoadableLine";
import MutateActionButton from "components/MutateActionButton";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import TableFooter from "components/TableFooter";
import TableHeader from "components/TableHeader";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Label, Loader, Table } from "semantic-ui-react";
import Form from "./components/Form";

function InstitutionLinkRow(props: {
  institutionLink: UserInstitutionLinkApiOut;
  onOpenEditForm: () => void;
}) {
  const navigate = useNavigate();

  const institutionQuery =
    api.endpoints.readInstitutionsInstitutionIdGet.useQuery(
      props.institutionLink.institution_id,
    );

  return (
    <Table.Row>
      <Table.Cell collapsing>
        <LoadableLine isLoading={institutionQuery.isLoading}>
          {institutionQuery.data && (
            <InstitutionLogo
              institution={institutionQuery.data}
              style={{ width: "2em" }}
            />
          )}
        </LoadableLine>
      </Table.Cell>
      <Table.Cell>
        <LoadableLine isLoading={institutionQuery.isLoading}>
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
          tooltip="Add account"
          disabled={props.institutionLink.is_synced}
          icon="credit card"
          content="Add"
          onClick={() =>
            navigate(
              `/accounts?isFormOpen=true&institutionLinkId=${props.institutionLink.id}`,
            )
          }
        />
      </Table.Cell>
      <Table.Cell collapsing>
        <MutateActionButton onOpenEditForm={props.onOpenEditForm} />
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
      <TableHeader headers={["", "Institution", "Website"]} actions={2} />
      <Table.Body>
        {props.institutionLinks.map((institutionLink) => (
          <InstitutionLinkRow
            key={institutionLink.id}
            institutionLink={institutionLink}
            onOpenEditForm={() => props.onOpenEditForm(institutionLink)}
          />
        ))}
      </Table.Body>
      <TableFooter columns={6} onCreate={props.onOpenCreateForm} />
    </Table>
  );
};

export default function InstitutionsLinks() {
  const [isFormOpen, setIsModalOpen] = useState(false);
  const [selectedInstitutionLink, setSelectedInstitutionLink] = useState<
    UserInstitutionLinkApiOut | undefined
  >(undefined);

  const institutionsLinksQuery =
    api.endpoints.readManyUsersMeInstitutionLinksGet.useQuery();

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

  if (institutionsLinksQuery.isError)
    return <QueryErrorMessage query={institutionsLinksQuery} />;

  return (
    <>
      <InstitutionLinksTable
        onOpenCreateForm={handleOpenCreateForm}
        onOpenEditForm={handleOpenEditForm}
        institutionLinks={institutionsLinksQuery.data || []}
      />
      <Form
        institutionLink={selectedInstitutionLink}
        open={isFormOpen}
        onClose={handleCloseForm}
      />
    </>
  );
}
