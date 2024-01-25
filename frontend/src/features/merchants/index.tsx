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

import { MerchantApiOut, api } from "app/services/api";
import ConfirmDeleteButton from "components/ConfirmDeleteButton";
import EditActionButton from "components/EditActionButton";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import TableHeader from "components/TableHeader";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import { useState } from "react";
import { Button, Loader, Table } from "semantic-ui-react";
import { logMutationError } from "utils/error";
import MerchantForm from "./components/Form";
import { CategoryIcon } from "features/categories/components/CategoryIcon";
import CreateNewButton from "components/CreateNewButton";

function MerchantRow(props: { merchant: MerchantApiOut }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteMerchant, deleteMerchantResult] =
    api.endpoints.deleteUsersMeMerchantsMerchantIdDelete.useMutation();

  async function handleDelete() {
    try {
      await deleteMerchant(props.merchant.id).unwrap();
    } catch (error) {
      logMutationError(error, deleteMerchantResult);
      return;
    }
  }

  return (
    <Table.Row key={props.merchant.id}>
      {isModalOpen && (
        <MerchantForm
          merchant={props.merchant}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <Table.Cell>{props.merchant.name}</Table.Cell>
      <Table.Cell>{props.merchant.pattern}</Table.Cell>
      <Table.Cell style={{ height: "5em" }}>
        <CategoryIcon categoryId={props.merchant.default_category_id} />
      </Table.Cell>
      <Table.Cell collapsing>
        <EditActionButton onOpenEditForm={() => setIsModalOpen(true)} />
      </Table.Cell>
      <Table.Cell collapsing>
        <ConfirmDeleteButton
          query={deleteMerchantResult}
          onDelete={handleDelete}
        />
      </Table.Cell>
    </Table.Row>
  );
}

const MerchantsTable = (props: {
  onOpenCreateForm: () => void;
  data: MerchantApiOut[];
}) => {
  const [updateAllMovements, updateAllMovementsResult] =
    api.endpoints.updateAllUsersMeMovementsPut.useMutation();

  async function handleUpdateAllMovements() {
    try {
      await updateAllMovements().unwrap();
    } catch (error) {
      logMutationError(error, updateAllMovementsResult);
      return;
    }
  }

  return (
    <Table>
      <TableHeader
        headers={["Name", "Pattern", "Default Category"]}
        actions={2}
      />
      <Table.Body>
        {props.data.map((merchant) => (
          <MerchantRow key={merchant.id} merchant={merchant} />
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.HeaderCell colSpan={7}>
            <Button
              onClick={handleUpdateAllMovements}
              loading={updateAllMovementsResult.isLoading}
              negative={updateAllMovementsResult.isError}
            >
              Update All Movements
            </Button>
            <CreateNewButton onCreate={props.onOpenCreateForm} />
          </Table.HeaderCell>
        </Table.Row>
      </Table.Footer>
    </Table>
  );
};

export default function Merchants() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<
    MerchantApiOut | undefined
  >(undefined);

  const merchantsQuery = api.endpoints.readManyUsersMeMerchantsGet.useQuery();

  const handleOpenCreateForm = () => {
    setSelectedMerchant(undefined);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setSelectedMerchant(undefined);
    setIsModalOpen(false);
  };

  if (merchantsQuery.isLoading || merchantsQuery.isUninitialized)
    return <Loader active size="huge" />;

  if (merchantsQuery.isError)
    return <QueryErrorMessage query={merchantsQuery} />;

  return (
    <>
      {merchantsQuery.data.length ? (
        <MerchantsTable
          data={merchantsQuery.data}
          onOpenCreateForm={handleOpenCreateForm}
        />
      ) : (
        <EmptyTablePlaceholder onCreate={handleOpenCreateForm} />
      )}
      {isModalOpen && (
        <MerchantForm merchant={selectedMerchant} onClose={handleClose} />
      )}
    </>
  );
}
