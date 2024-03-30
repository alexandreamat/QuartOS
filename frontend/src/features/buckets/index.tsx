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
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { BucketApiOut, api } from "app/services/api";
import CreateNewButton from "components/CreateNewButton";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import TableHeader from "components/TableHeader";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import { useState } from "react";
import { Loader, Table } from "semantic-ui-react";
import BucketForm from "./components/Form";
import MutateActionButton from "components/MutateActionButton";

function BucketRow(props: { bucket: BucketApiOut }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Table.Row key={props.bucket.id}>
      {isModalOpen && (
        <BucketForm
          bucket={props.bucket}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <Table.Cell>{props.bucket.name}</Table.Cell>
      <Table.Cell collapsing>
        <MutateActionButton onOpenEditForm={() => setIsModalOpen(true)} />
      </Table.Cell>
    </Table.Row>
  );
}

const BucketsTable = (props: {
  onOpenCreateForm: () => void;
  data: BucketApiOut[];
}) => {
  return (
    <Table>
      <TableHeader headers={["Name"]} actions={1} />
      <Table.Body>
        {props.data.map((bucket) => (
          <BucketRow key={bucket.id} bucket={bucket} />
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.HeaderCell colSpan={7}>
            <CreateNewButton onCreate={props.onOpenCreateForm} />
          </Table.HeaderCell>
        </Table.Row>
      </Table.Footer>
    </Table>
  );
};

export default function Buckets() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const bucketsQuery = api.endpoints.readManyUsersMeBucketsGet.useQuery();

  const handleOpenCreateForm = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  if (bucketsQuery.isLoading || bucketsQuery.isUninitialized)
    return <Loader active size="huge" />;

  if (bucketsQuery.isError) return <QueryErrorMessage query={bucketsQuery} />;

  return (
    <>
      {bucketsQuery.data.length ? (
        <BucketsTable
          data={bucketsQuery.data}
          onOpenCreateForm={handleOpenCreateForm}
        />
      ) : (
        <EmptyTablePlaceholder onCreate={handleOpenCreateForm} />
      )}
      {isModalOpen && <BucketForm onClose={handleClose} />}
    </>
  );
}
