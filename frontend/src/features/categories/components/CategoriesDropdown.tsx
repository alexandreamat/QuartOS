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
      options={options.options}
      loading={options.query.isLoading}
      error={options.query.isError}
      value={props.categoryId.value}
      onChange={(e, data) => props.categoryId.set(data.value as number)}
      selection
      search
    />
  );
}

function CategoriesDropdownForm(props: {
  categoryId: ReturnType<typeof useFormField<number | undefined>>;
}) {
  return (
    <Form.Field required>
      <label>
        {props.categoryId.label &&
          capitaliseFirstLetter(props.categoryId.label)}
      </label>
      <CategoriesDropdown categoryId={props.categoryId} />
    </Form.Field>
  );
}

CategoriesDropdown.Form = CategoriesDropdownForm;
