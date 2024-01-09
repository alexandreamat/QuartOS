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
import { Table, Loader, Label } from "semantic-ui-react";
import UserForm from "./Form";
import { UserApiOut, api } from "app/services/api";
import { logMutationError } from "utils/error";
import TableHeader from "components/TableHeader";
import TableFooter from "components/TableFooter";
import EditActionButton from "components/EditActionButton";
import ConfirmDeleteButton from "components/ConfirmDeleteButton";

export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserApiOut | undefined>(
    undefined
  );

  const usersQuery = api.endpoints.readManyApiUsersGet.useQuery({});
  const [deleteUser, deleteUserResult] =
    api.endpoints.deleteApiUsersUserIdDelete.useMutation();

  const handleCreate = () => {
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserApiOut) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user: UserApiOut) => {
    try {
      await deleteUser(user.id).unwrap();
    } catch (error) {
      logMutationError(error, deleteUserResult);
      return;
    }
  };

  const handleClose = () => {
    setSelectedUser(undefined);
    setIsModalOpen(false);
  };

  if (usersQuery.isLoading) return <Loader active size="huge" />;

  if (usersQuery.isError) console.error(usersQuery.originalArgs);

  const UsersTable = (props: { data: UserApiOut[] }) => (
    <Table>
      <TableHeader headers={["Name", "Email"]} actions={2} />
      <Table.Body>
        {props.data.map((user) => (
          <Table.Row key={user.id}>
            <Table.Cell>{user.full_name}</Table.Cell>
            <Table.Cell>
              <Label as="a" href={`mailto:${user.email}`}>
                {user.email}
              </Label>
            </Table.Cell>
            <Table.Cell collapsing>
              <EditActionButton onOpenEditForm={() => handleEdit(user)} />
            </Table.Cell>
            <Table.Cell collapsing>
              <ConfirmDeleteButton
                query={deleteUserResult}
                onDelete={async () => await handleDelete(user)}
              />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <TableFooter columns={4} onCreate={handleCreate} />
    </Table>
  );

  return (
    <>
      <UsersTable data={usersQuery.data || []} />
      <UserForm user={selectedUser} open={isModalOpen} onClose={handleClose} />
    </>
  );
}
