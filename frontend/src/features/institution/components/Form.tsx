import { Message } from "semantic-ui-react";
import { useEffect } from "react";
import { InstitutionApiOut, InstitutionApiIn, api } from "app/services/api";
import { logMutationError, renderErrorMessage } from "utils/error";
import { getAlpha2Codes, getName, registerLocale } from "i18n-iso-countries";
import FormModal from "components/FormModal";
import useFormField from "hooks/useFormField";
import FormTextInput from "components/FormTextInput";
import FormDropdownInput from "components/FormDropdownInput";
import { useTransactionDeserialiserOptions } from "features/transactiondeserialiser/hooks";
import { FormValidationError } from "components/FormValidationError";

registerLocale(require("i18n-iso-countries/langs/en.json"));

const countryOptions = Object.keys(getAlpha2Codes()).map((alpha2: string) => ({
  key: alpha2,
  value: alpha2,
  text: getName(alpha2, "en"),
  flag: alpha2.toLocaleLowerCase(),
}));

export default function InstitutionForm(props: {
  institution?: InstitutionApiOut;
  open: boolean;
  onClose: () => void;
}) {
  const name = useFormField("");
  const countryCode = useFormField("");
  const url = useFormField("");
  const transactionDeserialiserId = useFormField(0, undefined, true);

  const transactionDeserialiserOptions = useTransactionDeserialiserOptions();

  const fields = [name, countryCode, url, transactionDeserialiserId];

  const [createInstitution, createInstitutionResult] =
    api.endpoints.createApiInstitutionsPost.useMutation();
  const [updateInstitution, updateInstitutionResult] =
    api.endpoints.updateApiInstitutionsIdPut.useMutation();

  useEffect(() => {
    if (!props.institution) return;
    name.set(props.institution.name);
    countryCode.set(props.institution.country_code);
    url.set(props.institution.url || "");
    transactionDeserialiserId.set(props.institution.transactiondeserialiser_id);
  }, [props.institution]);

  const handleClose = () => {
    fields.forEach((field) => field.reset());
    props.onClose();
  };

  const handleSubmit = async () => {
    const invalidFields = fields.filter((field) => !field.validate());
    if (invalidFields.length > 0) return;
    const institution: InstitutionApiIn = {
      name: name.value!,
      country_code: countryCode.value!,
      url: url.value!,
      transactiondeserialiser_id: transactionDeserialiserId.value!,
    };
    if (props.institution) {
      try {
        await updateInstitution({
          id: props.institution.id,
          institutionApiIn: institution,
        }).unwrap();
      } catch (error) {
        logMutationError(error, updateInstitutionResult);
        return;
      }
    } else {
      try {
        await createInstitution(institution).unwrap();
      } catch (error) {
        logMutationError(error, createInstitutionResult);
        return;
      }
    }
    handleClose();
  };

  return (
    <FormModal
      open={props.open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={
        (props.institution ? "Edit" : "Add") + " a Financial Institution Link"
      }
    >
      <FormTextInput label="Name" field={name} />
      <FormTextInput type="url" label="Website" field={url} />
      <FormDropdownInput
        label="Country"
        options={countryOptions}
        field={countryCode}
      />
      <FormDropdownInput
        optional
        label="Transaction deserialiser"
        options={transactionDeserialiserOptions.data || []}
        query={transactionDeserialiserOptions}
        field={transactionDeserialiserId}
      />
      <FormValidationError fields={fields} />
      {createInstitutionResult.isError && (
        <Message negative>
          <Message.Header>There's been an error</Message.Header>
          {renderErrorMessage(createInstitutionResult.error)}
        </Message>
      )}
      {updateInstitutionResult.isError && (
        <Message negative>
          <Message.Header>There's been an error</Message.Header>
          {renderErrorMessage(updateInstitutionResult.error)}
        </Message>
      )}
    </FormModal>
  );
}
