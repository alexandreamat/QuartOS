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

import {
  Button,
  Divider,
  Form,
  Header,
  Message,
  Modal,
} from "semantic-ui-react";
import { useEffect } from "react";
import {
  UserInstitutionLinkApiIn,
  UserInstitutionLinkApiOut,
  api,
} from "app/services/api";
import useFormField from "hooks/useFormField";
import FormDropdownInput from "components/FormDropdownInput";
import PlaidLinkButton from "./PlaidLinkButton";
import { useInstitutionOptions } from "features/institution/hooks";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { logMutationError } from "utils/error";
import ConfirmDeleteButtonModal from "components/ConfirmDeleteButtonModal";

export default function InstitutionLinkForm(props: {
  open: boolean;
  onClose: () => void;
  institutionLink?: UserInstitutionLinkApiOut;
}) {
  const institutionId = useFormField(0);

  const institutionOptions = useInstitutionOptions();

  const [createInstitutionLink, createInstitutionLinkResult] =
    api.endpoints.createApiUsersMeInstitutionLinksPost.useMutation();
  const [updateInstitutionLink, updateInstitutionLinkResult] =
    api.endpoints.updateApiUsersMeInstitutionLinksUserinstitutionlinkIdPut.useMutation();
  const [deleteInstitutionLink, deleteInstitutionLinkResult] =
    api.endpoints.deleteApiUsersMeInstitutionLinksUserinstitutionlinkIdDelete.useMutation();

  useEffect(() => {
    if (!props.institutionLink) return;
    institutionId.set(props.institutionLink.institution_id);
  }, [props.institutionLink]);

  const handleClose = () => {
    institutionId.reset();
    props.onClose();
  };

  const handleSubmit = async () => {
    if (!institutionId.validate()) return;

    const institutionLink: UserInstitutionLinkApiIn = {
      institution_id: institutionId.value!,
    };
    if (props.institutionLink) {
      try {
        await updateInstitutionLink({
          userinstitutionlinkId: props.institutionLink.id,
          userInstitutionLinkApiIn: institutionLink,
        }).unwrap();
      } catch (error) {
        logMutationError(error, updateInstitutionLinkResult);
        return;
      }
    } else {
      try {
        await createInstitutionLink({
          institutionId: institutionId.value!,
          userInstitutionLinkApiIn: institutionLink,
        }).unwrap();
      } catch (error) {
        logMutationError(error, createInstitutionLinkResult);
        return;
      }
    }
    handleClose();
  };

  async function handleDelete() {
    if (!props.institutionLink) return;

    try {
      await deleteInstitutionLink(props.institutionLink.id).unwrap();
    } catch (error) {
      logMutationError(error, deleteInstitutionLinkResult);
      return;
    }
  }

  return (
    <Modal open={props.open} onClose={handleClose}>
      <Modal.Header>
        {(props.institutionLink ? "Edit" : "Add") +
          " a Financial Institution Link"}
      </Modal.Header>
      <Modal.Content>
        <Form>
          {(!props.institutionLink || props.institutionLink.is_synced) && (
            <PlaidLinkButton
              onSuccess={handleClose}
              institutionLink={props.institutionLink}
            />
          )}
          {!props.institutionLink && (
            <>
              <Divider horizontal>Or</Divider>
              <Header textAlign="center">Create one manually</Header>
            </>
          )}
          {(!props.institutionLink || !props.institutionLink.is_synced) && (
            <FormDropdownInput
              label="Institution"
              options={institutionOptions.options}
              query={institutionOptions.query}
              field={institutionId}
            />
          )}
        </Form>
        {institutionId.isError && (
          <Message
            error
            header="Action Forbidden"
            content="All fields are required!"
          />
        )}
        <QueryErrorMessage query={createInstitutionLinkResult} />
        <QueryErrorMessage query={updateInstitutionLinkResult} />
      </Modal.Content>
      <Modal.Actions>
        {props.institutionLink && (
          <ConfirmDeleteButtonModal
            query={deleteInstitutionLinkResult}
            onDelete={handleDelete}
            confirmContent={
              "All associated account and transaction data WILL BE LOST. Are you sure?"
            }
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
        />
      </Modal.Actions>
    </Modal>
  );
}
