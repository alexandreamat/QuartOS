// Copyright (C) 2023 Alexandre Amat
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

const useFormField = <T,>(
  initialValue?: T,
  label?: string,
  optional?: boolean,
) => {
  const [value, setValue] = useState(initialValue);
  const [isError, setIsError] = useState(false);

  const validate = () => {
    if (optional) return true;
    var isValid: boolean;
    switch (typeof value) {
      case "boolean":
        isValid = true;
        break;
      case "string":
        isValid = value.length !== 0;
        break;
      case "number":
        isValid = value !== 0;
        break;
      default:
        isValid = Boolean(value) && value !== undefined;
        break;
    }
    setIsError(!isValid);
    if (!isValid) console.error(`Value ${value} (${typeof value}) is invalid`);
    return isValid;
  };

  const reset = () => {
    setValue(initialValue);
    setIsError(false);
  };

  const hasChanged = initialValue !== value;

  return { value, label, set: setValue, isError, validate, reset, hasChanged };
};

export default useFormField;
