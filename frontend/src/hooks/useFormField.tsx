import { useState } from "react";

const useFormField = <T,>(
  initialValue?: T,
  label?: string,
  optional?: boolean
) => {
  const [value, setValue] = useState(initialValue);
  const [isError, setIsError] = useState(false);

  const validate = () => {
    if (typeof value === "boolean") return true;
    if (optional) return true;
    const isValid = Boolean(value) && value !== undefined;
    setIsError(!isValid);
    if (!isValid) console.log(`Value of type ${typeof value} is invalid`);
    return isValid;
  };

  const reset = () => {
    setValue(initialValue);
    setIsError(false);
  };

  return { value, label, set: setValue, isError, validate, reset };
};

export default useFormField;
