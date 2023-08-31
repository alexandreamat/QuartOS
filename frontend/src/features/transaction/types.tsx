import useFormField from "hooks/useFormField";

export type TransactionApiInForm = {
  amountStr: ReturnType<typeof useFormField<string>>;
  timestamp: ReturnType<typeof useFormField<Date>>;
  name: ReturnType<typeof useFormField<string>>;
  accountId: ReturnType<typeof useFormField<number>>;
};
