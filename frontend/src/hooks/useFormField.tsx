import { useState } from "react";

const useFormField = <T,>(initialValue?: T, optional?: boolean) => {
  const [value, setValue] = useState(initialValue);
  const [isError, setIsError] = useState(false);

  const validate = () => {
    if (optional) return true;
    const isValid = Boolean(value) && value !== undefined;
    setIsError(!isValid);
    return isValid;
  };

  const reset = () => {
    setValue(initialValue);
    setIsError(false);
  };

  return { value, set: setValue, isError, validate, reset };
};

export default useFormField;
