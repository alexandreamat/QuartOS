import { Divider, Header, Message } from "semantic-ui-react";
import { useEffect } from "react";
import {
  UserInstitutionLinkApiIn,
  UserInstitutionLinkApiOut,
  api,
} from "app/services/api";
import FormModal from "components/FormModal";
import useFormField from "hooks/useFormField";
import FormDropdownInput from "components/FormDropdownInput";
import PlaidLinkButton from "features/institutionlink/PlaidLinkButton";
import { useInstitutionOptions } from "features/institution/hooks";
import { QueryErrorMessage } from "components/QueryErrorMessage";

export default function InstitutionLinkForm(props: {
  institutionLink?: UserInstitutionLinkApiOut;
  open: boolean;
  onClose: () => void;
}) {
  const institutionId = useFormField(0);

  const institutionOptions = useInstitutionOptions();

  const [createInstitutionLink, createInstitutionLinkResult] =
    api.endpoints.createApiInstitutionLinksPost.useMutation();
  const [updateInstitutionLink, updateInstitutionLinkResult] =
    api.endpoints.updateApiInstitutionLinksIdPut.useMutation();

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
          id: props.institutionLink.id,
          userInstitutionLinkApiIn: institutionLink,
        }).unwrap();
      } catch (error) {
        console.error(error);
        console.error(updateInstitutionLinkResult.originalArgs);
        return;
      }
    } else {
      try {
        await createInstitutionLink(institutionLink).unwrap();
      } catch (error) {
        console.error(error);
        console.error(createInstitutionLinkResult.originalArgs);
        return;
      }
    }
    handleClose();
  };

  return (
    <FormModal
      open={props.open}
      onClose={handleClose}
      title={
        (props.institutionLink ? "Edit" : "Add") +
        " a Financial Institution Link"
      }
      onSubmit={handleSubmit}
    >
      {!props.institutionLink && (
        <>
          <PlaidLinkButton onSuccess={handleClose} />
          <Divider horizontal>Or</Divider>
          <Header textAlign="center">Create one manually</Header>
        </>
      )}
      <FormDropdownInput
        label="Institution"
        options={institutionOptions.data || []}
        query={institutionOptions}
        field={institutionId}
      />
      {institutionId.isError && (
        <Message
          error
          header="Action Forbidden"
          content="All fields are required!"
        />
      )}
      <QueryErrorMessage query={createInstitutionLinkResult} />
      <QueryErrorMessage query={updateInstitutionLinkResult} />
    </FormModal>
  );
}
