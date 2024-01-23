import useFormField from "hooks/useFormField";
import { Dropdown } from "semantic-ui-react";
import { useCategoryOptions } from "features/categories/hooks";

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
