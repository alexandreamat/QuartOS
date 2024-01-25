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

import { MerchantApiIn, MerchantApiOut, api } from "app/services/api";
import FormModal from "components/FormModal";
import FormTextInput from "components/FormTextInput";
import { FormValidationError } from "components/FormValidationError";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import CategoriesDropdown from "features/categories/components/CategoriesDropdown";
import useFormField from "hooks/useFormField";
import { registerLocale } from "i18n-iso-countries";
import { useEffect } from "react";
import { Button, Form, Modal } from "semantic-ui-react";
import { logMutationError } from "utils/error";

registerLocale(require("i18n-iso-countries/langs/en.json"));

export default function MerchantForm(props: {
  merchant?: MerchantApiOut;
  onClose: () => void;
}) {
  const name = useFormField("");
  const pattern = useFormField("");
  const defaultCategoryId = useFormField<number>(undefined, "Default Category");

  const fields = [name, pattern, defaultCategoryId];

  const [createMerchant, createMerchantResult] =
    api.endpoints.createUsersMeMerchantsPost.useMutation();
  const [updateMerchant, updateMerchantResult] =
    api.endpoints.updateUsersMeMerchantsMerchantIdPut.useMutation();

  useEffect(() => {
    if (!props.merchant) return;
    name.set(props.merchant.name);
    pattern.set(props.merchant.pattern);
    defaultCategoryId.set(props.merchant.default_category_id);
  }, [props.merchant]);

  const handleClose = () => {
    fields.forEach((field) => field.reset());
    props.onClose();
  };

  const handleSubmit = async () => {
    const invalidFields = fields.filter((field) => !field.validate());
    if (invalidFields.length > 0) return;
    const merchant: MerchantApiIn = {
      name: name.value!,
      pattern: pattern.value!,
      default_category_id: defaultCategoryId.value!,
    };
    if (props.merchant) {
      try {
        await updateMerchant({
          merchantId: props.merchant.id,
          merchantApiIn: merchant,
        }).unwrap();
      } catch (error) {
        logMutationError(error, updateMerchantResult);
        return;
      }
    } else {
      try {
        await createMerchant(merchant).unwrap();
      } catch (error) {
        logMutationError(error, createMerchantResult);
        return;
      }
    }
    handleClose();
  };

  return (
    <Modal open onClose={handleClose} size="mini">
      <Modal.Header>
        {(props.merchant ? "Edit" : "Add") + " a merchant"}
      </Modal.Header>
      <Modal.Content>
        <Form>
          <FormTextInput label="Name" field={name} />
          <FormTextInput label="Pattern" field={pattern} />
          <CategoriesDropdown.Form categoryId={defaultCategoryId} />
          <FormValidationError fields={fields} />
          {createMerchantResult.isError && (
            <QueryErrorMessage query={createMerchantResult} />
          )}
          {updateMerchantResult.isError && (
            <QueryErrorMessage query={updateMerchantResult} />
          )}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          content="Save"
          type="submit"
          labelPosition="right"
          icon="checkmark"
          onClick={handleSubmit}
          positive
          loading={
            createMerchantResult.isLoading || updateMerchantResult.isLoading
          }
        />
      </Modal.Actions>
    </Modal>
  );
}
