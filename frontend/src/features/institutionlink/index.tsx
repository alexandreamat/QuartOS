import { useState } from "react";
import { Table, Loader, Label } from "semantic-ui-react";
import Form from "./components/Form";
import { UserInstitutionLinkApiOut, api } from "app/services/api";
import { logMutationError } from "utils/error";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import ActionButton from "components/ActionButton";
import LoadableLine from "components/LoadableLine";
import TableHeader from "components/TableHeader";
import TableFooter from "components/TableFooter";
import MutateActionButton from "components/MutateActionButton";
import { useNavigate } from "react-router-dom";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";

function InstitutionLinkRow(props: {
  institutionLink: UserInstitutionLinkApiOut;
  onOpenEditForm: () => void;
}) {
  const navigate = useNavigate();

  const [syncLink, syncLinkResult] =
    api.endpoints.syncApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidSyncPost.useMutation();

  const handleSync = async (userInstitutionLink: UserInstitutionLinkApiOut) => {
    try {
      await syncLink(userInstitutionLink.id).unwrap();
    } catch (error) {
      if (typeof error === "object" && error) {
        if ("data" in error && typeof error.data === "object" && error.data) {
          const data = error.data;
          if ("detail" in data && typeof data.detail === "string") {
            const detail = data.detail;
            if (detail === "ITEM_LOGIN_REQUIRED") {
              props.onOpenEditForm();
              return;
            }
          }
        }
      }
      logMutationError(error, syncLinkResult);
      return;
    }
  };

  const institutionQuery =
    api.endpoints.readApiInstitutionsInstitutionIdGet.useQuery(
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
          tooltip="Sync"
          disabled={!props.institutionLink.is_synced}
          loading={syncLinkResult.isLoading}
          negative={syncLinkResult.isError}
          icon="sync"
          onClick={async () => await handleSync(props.institutionLink)}
        />
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
      <TableHeader headers={["", "Institution", "Website"]} actions={3} />
      <Table.Body>
        {props.institutionLinks.map((institutionLink) => (
          <InstitutionLinkRow
            key={institutionLink.id}
            institutionLink={institutionLink}
            onOpenEditForm={() => props.onOpenEditForm(institutionLink)}
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
    api.endpoints.readManyApiUsersMeInstitutionLinksGet.useQuery();

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
      <Form
        institutionLink={selectedInstitutionLink}
        open={isFormOpen}
        onClose={handleCloseForm}
      />
    </>
  );
}
