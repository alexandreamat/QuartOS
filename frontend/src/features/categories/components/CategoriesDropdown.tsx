import useFormField from "hooks/useFormField";
import { Dropdown, Form } from "semantic-ui-react";
import { useCategoryOptions } from "features/categories/hooks";
import { capitaliseFirstLetter } from "utils/string";

export default function CategoriesDropdown(props: {
  categoryId: ReturnType<typeof useFormField<number | undefined>>;
}) {
  const options = useCategoryOptions();

  return (
    <Dropdown
      options={[
        { key: 0, value: undefined, text: "Select category" },
        ...options.options,
      ]}
      loading={options.query.isLoading}
      disabled={!options.query.isSuccess}
      error={options.query.isError}
      value={props.categoryId.value}
      onChange={(e, data) => props.categoryId.set(data.value as number)}
      selection
      search
      placeholder="Select category"
    />
  );
}

function CategoriesDropdownForm(props: {
  categoryId: ReturnType<typeof useFormField<number | undefined>>;
}) {
  return (
    <Form.Field required error={props.categoryId.isError}>
      <label>
        {props.categoryId.label &&
          capitaliseFirstLetter(props.categoryId.label)}
      </label>
      <CategoriesDropdown categoryId={props.categoryId} />
    </Form.Field>
  );
}

CategoriesDropdown.Form = CategoriesDropdownForm;
