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

import { BucketApiIn, BucketApiOut, api } from "app/services/api";
import ConfirmDeleteButtonModal from "components/ConfirmDeleteButtonModal";
import FormTextInput from "components/FormTextInput";
import { FormValidationError } from "components/FormValidationError";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import useFormField from "hooks/useFormField";
import { useEffect } from "react";
import { Button, Form, Modal } from "semantic-ui-react";
import { logMutationError } from "utils/error";

export default function BucketForm(props: {
  bucket?: BucketApiOut;
  onClose: () => void;
}) {
  const name = useFormField("");

  const fields = [name];

  const [createBucket, createBucketResult] =
    api.endpoints.createUsersMeBucketsPost.useMutation();
  const [updateBucket, updateBucketResult] =
    api.endpoints.updateUsersMeBucketsBucketIdPut.useMutation();

  const [deleteBucket, deleteBucketResult] =
    api.endpoints.deleteUsersMeBucketsBucketIdDelete.useMutation();

  useEffect(() => {
    if (!props.bucket) return;
    name.set(props.bucket.name);
  }, [props.bucket]);

  const handleClose = () => {
    fields.forEach((field) => field.reset());
    props.onClose();
  };

  const handleSubmit = async () => {
    const invalidFields = fields.filter((field) => !field.validate());
    if (invalidFields.length > 0) return;
    const bucket: BucketApiIn = { name: name.value! };
    if (props.bucket) {
      try {
        await updateBucket({
          bucketId: props.bucket.id,
          bucketApiIn: bucket,
        }).unwrap();
      } catch (error) {
        logMutationError(error, updateBucketResult);
        return;
      }
    } else {
      try {
        await createBucket(bucket).unwrap();
      } catch (error) {
        logMutationError(error, createBucketResult);
        return;
      }
    }
    handleClose();
  };

  async function handleDelete() {
    if (!props.bucket) return;
    try {
      await deleteBucket(props.bucket.id).unwrap();
    } catch (error) {
      logMutationError(error, deleteBucketResult);
      return;
    }
  }

  return (
    <Modal open onClose={handleClose} size="small">
      <Modal.Header>
        {(props.bucket ? "Edit" : "Add") + " a bucket"}
      </Modal.Header>
      <Modal.Content>
        <Form>
          <FormTextInput label="Name" field={name} />
          <FormValidationError fields={fields} />
          {createBucketResult.isError && (
            <QueryErrorMessage query={createBucketResult} />
          )}
          {updateBucketResult.isError && (
            <QueryErrorMessage query={updateBucketResult} />
          )}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        {props.bucket && (
          <ConfirmDeleteButtonModal
            onSubmit={handleDelete}
            query={deleteBucketResult}
          />
        )}
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          content="Save"
          type="submit"
          labelPosition="right"
          icon="checkmark"
          onClick={handleSubmit}
          positive
          loading={createBucketResult.isLoading || updateBucketResult.isLoading}
        />
      </Modal.Actions>
    </Modal>
  );
}
