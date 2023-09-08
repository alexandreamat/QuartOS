import { useState } from "react";

const useFormField = <T,>(
  initialValue?: T,
  label?: string,
  optional?: boolean
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
    if (!isValid) console.error(`Value of type ${typeof value} is invalid`);
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
