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

import { useState } from "react";

export type Checkboxes = ReturnType<typeof useCheckboxes>;

export function useCheckboxes(
  initalChecked?: Set<number>,
  disabled?: Set<number>,
) {
  const disabled_ = new Set<number>(disabled);
  const [checked, setChecked] = useState(new Set<number>(initalChecked));

  function handleChange(id: number, checked: boolean) {
    if (disabled_.has(id)) return;

    setChecked((x) => {
      if (checked) x.add(id);
      else x.delete(id);
      return new Set(x);
    });
  }

  function reset() {
    setChecked(new Set());
  }

  return {
    checked,
    disabled: disabled_,
    onChange: handleChange,
    reset,
  };
}
