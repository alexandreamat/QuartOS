import { useState } from "react";

export type Checkboxes = ReturnType<typeof useCheckboxes>;

export function useCheckboxes() {
  const [checked, setChecked] = useState(new Set<number>());

  function handleChange(id: number, checked: boolean) {
    setChecked((x) => {
      if (checked) x.add(id);
      else x.delete(id);
      return new Set(x);
    });
  }

  function reset() {
    setChecked(new Set());
  }

  return { checked, onChange: handleChange, reset };
}
