import { PaymentChannel, TransactionCode } from "app/services/api";
import useFormField from "hooks/useFormField";

export type TransactionApiInForm = {
  amountStr: ReturnType<typeof useFormField<string>>;
  timestamp: ReturnType<typeof useFormField<Date>>;
  name: ReturnType<typeof useFormField<string>>;
  currencyCode: ReturnType<typeof useFormField<string>>;
  accountId: ReturnType<typeof useFormField<number>>;
  paymentChannel: ReturnType<typeof useFormField<string>>;
  code: ReturnType<typeof useFormField<string>>;
};
