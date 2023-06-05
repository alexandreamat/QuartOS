import { emptySplitApi as api } from "./emptyApi";
export const addTagTypes = [
  "auth",
  "transaction-deserialisers",
  "users",
  "institutions",
  "institution-links",
  "accounts",
  "transactions",
  "utils",
  "plaid",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      loginApiAuthLoginPost: build.mutation<
        LoginApiAuthLoginPostApiResponse,
        LoginApiAuthLoginPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/auth/login`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["auth"],
      }),
      recoverApiAuthRecoverPasswordEmailPost: build.mutation<
        RecoverApiAuthRecoverPasswordEmailPostApiResponse,
        RecoverApiAuthRecoverPasswordEmailPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/auth/recover-password/${queryArg}`,
          method: "POST",
        }),
        invalidatesTags: ["auth"],
      }),
      resetApiAuthResetPasswordPost: build.mutation<
        ResetApiAuthResetPasswordPostApiResponse,
        ResetApiAuthResetPasswordPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/auth/reset-password/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["auth"],
      }),
      readManyApiTransactionDeserialisersGet: build.query<
        ReadManyApiTransactionDeserialisersGetApiResponse,
        ReadManyApiTransactionDeserialisersGetApiArg
      >({
        query: () => ({ url: `/api/transaction-deserialisers/` }),
        providesTags: ["transaction-deserialisers"],
      }),
      createApiTransactionDeserialisersPost: build.mutation<
        CreateApiTransactionDeserialisersPostApiResponse,
        CreateApiTransactionDeserialisersPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/transaction-deserialisers/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["transaction-deserialisers"],
      }),
      readApiTransactionDeserialisersIdGet: build.query<
        ReadApiTransactionDeserialisersIdGetApiResponse,
        ReadApiTransactionDeserialisersIdGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/transaction-deserialisers/${queryArg}`,
        }),
        providesTags: ["transaction-deserialisers"],
      }),
      updateApiTransactionDeserialisersIdPut: build.mutation<
        UpdateApiTransactionDeserialisersIdPutApiResponse,
        UpdateApiTransactionDeserialisersIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/transaction-deserialisers/${queryArg.id}`,
          method: "PUT",
          body: queryArg.transactionDeserialiserApiIn,
        }),
        invalidatesTags: ["transaction-deserialisers"],
      }),
      deleteApiTransactionDeserialisersIdDelete: build.mutation<
        DeleteApiTransactionDeserialisersIdDeleteApiResponse,
        DeleteApiTransactionDeserialisersIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/transaction-deserialisers/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["transaction-deserialisers"],
      }),
      signupApiUsersSignupPost: build.mutation<
        SignupApiUsersSignupPostApiResponse,
        SignupApiUsersSignupPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/signup`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["users"],
      }),
      readMeApiUsersMeGet: build.query<
        ReadMeApiUsersMeGetApiResponse,
        ReadMeApiUsersMeGetApiArg
      >({
        query: () => ({ url: `/api/users/me` }),
        providesTags: ["users"],
      }),
      updateMeApiUsersMePut: build.mutation<
        UpdateMeApiUsersMePutApiResponse,
        UpdateMeApiUsersMePutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me`,
          method: "PUT",
          body: queryArg,
        }),
        invalidatesTags: ["users"],
      }),
      readApiUsersIdGet: build.query<
        ReadApiUsersIdGetApiResponse,
        ReadApiUsersIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/api/users/${queryArg}` }),
        providesTags: ["users"],
      }),
      updateApiUsersIdPut: build.mutation<
        UpdateApiUsersIdPutApiResponse,
        UpdateApiUsersIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/${queryArg.id}`,
          method: "PUT",
          body: queryArg.userApiIn,
        }),
        invalidatesTags: ["users"],
      }),
      deleteApiUsersIdDelete: build.mutation<
        DeleteApiUsersIdDeleteApiResponse,
        DeleteApiUsersIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["users"],
      }),
      readManyApiUsersGet: build.query<
        ReadManyApiUsersGetApiResponse,
        ReadManyApiUsersGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/`,
          params: { skip: queryArg.skip, limit: queryArg.limit },
        }),
        providesTags: ["users"],
      }),
      createApiUsersPost: build.mutation<
        CreateApiUsersPostApiResponse,
        CreateApiUsersPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["users"],
      }),
      readManyApiInstitutionsGet: build.query<
        ReadManyApiInstitutionsGetApiResponse,
        ReadManyApiInstitutionsGetApiArg
      >({
        query: () => ({ url: `/api/institutions/` }),
        providesTags: ["institutions"],
      }),
      createApiInstitutionsPost: build.mutation<
        CreateApiInstitutionsPostApiResponse,
        CreateApiInstitutionsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/institutions/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["institutions"],
      }),
      readApiInstitutionsIdGet: build.query<
        ReadApiInstitutionsIdGetApiResponse,
        ReadApiInstitutionsIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/api/institutions/${queryArg}` }),
        providesTags: ["institutions"],
      }),
      updateApiInstitutionsIdPut: build.mutation<
        UpdateApiInstitutionsIdPutApiResponse,
        UpdateApiInstitutionsIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/institutions/${queryArg.id}`,
          method: "PUT",
          body: queryArg.institutionApiIn,
        }),
        invalidatesTags: ["institutions"],
      }),
      deleteApiInstitutionsIdDelete: build.mutation<
        DeleteApiInstitutionsIdDeleteApiResponse,
        DeleteApiInstitutionsIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/institutions/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["institutions"],
      }),
      readManyApiInstitutionLinksGet: build.query<
        ReadManyApiInstitutionLinksGetApiResponse,
        ReadManyApiInstitutionLinksGetApiArg
      >({
        query: () => ({ url: `/api/institution-links/` }),
        providesTags: ["institution-links"],
      }),
      createApiInstitutionLinksPost: build.mutation<
        CreateApiInstitutionLinksPostApiResponse,
        CreateApiInstitutionLinksPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/institution-links/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["institution-links"],
      }),
      readAccountsApiInstitutionLinksIdAccountsGet: build.query<
        ReadAccountsApiInstitutionLinksIdAccountsGetApiResponse,
        ReadAccountsApiInstitutionLinksIdAccountsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/institution-links/${queryArg}/accounts`,
        }),
        providesTags: ["institution-links"],
      }),
      readApiInstitutionLinksIdGet: build.query<
        ReadApiInstitutionLinksIdGetApiResponse,
        ReadApiInstitutionLinksIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/api/institution-links/${queryArg}` }),
        providesTags: ["institution-links"],
      }),
      updateApiInstitutionLinksIdPut: build.mutation<
        UpdateApiInstitutionLinksIdPutApiResponse,
        UpdateApiInstitutionLinksIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/institution-links/${queryArg.id}`,
          method: "PUT",
          body: queryArg.institutionLinkApiIn,
        }),
        invalidatesTags: ["institution-links"],
      }),
      deleteApiInstitutionLinksIdDelete: build.mutation<
        DeleteApiInstitutionLinksIdDeleteApiResponse,
        DeleteApiInstitutionLinksIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/institution-links/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["institution-links"],
      }),
      syncApiInstitutionLinksIdSyncPost: build.mutation<
        SyncApiInstitutionLinksIdSyncPostApiResponse,
        SyncApiInstitutionLinksIdSyncPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/institution-links/${queryArg}/sync`,
          method: "POST",
        }),
        invalidatesTags: ["institution-links"],
      }),
      readManyApiAccountsGet: build.query<
        ReadManyApiAccountsGetApiResponse,
        ReadManyApiAccountsGetApiArg
      >({
        query: () => ({ url: `/api/accounts/` }),
        providesTags: ["accounts"],
      }),
      createApiAccountsPost: build.mutation<
        CreateApiAccountsPostApiResponse,
        CreateApiAccountsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/accounts/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["accounts"],
      }),
      readApiAccountsIdGet: build.query<
        ReadApiAccountsIdGetApiResponse,
        ReadApiAccountsIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/api/accounts/${queryArg}` }),
        providesTags: ["accounts"],
      }),
      updateApiAccountsIdPut: build.mutation<
        UpdateApiAccountsIdPutApiResponse,
        UpdateApiAccountsIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/accounts/${queryArg.id}`,
          method: "PUT",
          body: queryArg.accountApiIn,
        }),
        invalidatesTags: ["accounts"],
      }),
      deleteApiAccountsIdDelete: build.mutation<
        DeleteApiAccountsIdDeleteApiResponse,
        DeleteApiAccountsIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/accounts/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["accounts"],
      }),
      uploadTransactionsSheetApiAccountsIdTransactionsSheetPost: build.mutation<
        UploadTransactionsSheetApiAccountsIdTransactionsSheetPostApiResponse,
        UploadTransactionsSheetApiAccountsIdTransactionsSheetPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/accounts/${queryArg.id}/transactions-sheet`,
          method: "POST",
          body: queryArg.bodyUploadTransactionsSheetApiAccountsIdTransactionsSheetPost,
        }),
        invalidatesTags: ["accounts"],
      }),
      readManyApiTransactionsGet: build.query<
        ReadManyApiTransactionsGetApiResponse,
        ReadManyApiTransactionsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/transactions/`,
          params: { page: queryArg.page, per_page: queryArg.perPage },
        }),
        providesTags: ["transactions"],
      }),
      createApiTransactionsPost: build.mutation<
        CreateApiTransactionsPostApiResponse,
        CreateApiTransactionsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/transactions/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["transactions"],
      }),
      readApiTransactionsIdGet: build.query<
        ReadApiTransactionsIdGetApiResponse,
        ReadApiTransactionsIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/api/transactions/${queryArg}` }),
        providesTags: ["transactions"],
      }),
      updateApiTransactionsIdPut: build.mutation<
        UpdateApiTransactionsIdPutApiResponse,
        UpdateApiTransactionsIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/transactions/${queryArg.id}`,
          method: "PUT",
          body: queryArg.transactionApiIn,
        }),
        invalidatesTags: ["transactions"],
      }),
      deleteApiTransactionsIdDelete: build.mutation<
        DeleteApiTransactionsIdDeleteApiResponse,
        DeleteApiTransactionsIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/transactions/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["transactions"],
      }),
      testCeleryApiUtilsTestCeleryPost: build.mutation<
        TestCeleryApiUtilsTestCeleryPostApiResponse,
        TestCeleryApiUtilsTestCeleryPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/utils/test-celery/`,
          method: "POST",
          params: { msg: queryArg },
        }),
        invalidatesTags: ["utils"],
      }),
      testEmailApiUtilsTestEmailPost: build.mutation<
        TestEmailApiUtilsTestEmailPostApiResponse,
        TestEmailApiUtilsTestEmailPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/utils/test-email/`,
          method: "POST",
          params: { email_to: queryArg },
        }),
        invalidatesTags: ["utils"],
      }),
      getLinkTokenApiPlaidLinkTokenGet: build.query<
        GetLinkTokenApiPlaidLinkTokenGetApiResponse,
        GetLinkTokenApiPlaidLinkTokenGetApiArg
      >({
        query: () => ({ url: `/api/plaid/link_token` }),
        providesTags: [
          "plaid",
          "institution-links",
          "institutions",
          "accounts",
          "transactions",
        ],
      }),
      setPublicTokenApiPlaidPublicTokenPost: build.mutation<
        SetPublicTokenApiPlaidPublicTokenPostApiResponse,
        SetPublicTokenApiPlaidPublicTokenPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/plaid/public_token`,
          method: "POST",
          params: {
            public_token: queryArg.publicToken,
            institution_plaid_id: queryArg.institutionPlaidId,
          },
        }),
        invalidatesTags: [
          "plaid",
          "institution-links",
          "institutions",
          "accounts",
          "transactions",
        ],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as api };
export type LoginApiAuthLoginPostApiResponse =
  /** status 200 Successful Response */ Token;
export type LoginApiAuthLoginPostApiArg = BodyLoginApiAuthLoginPost;
export type RecoverApiAuthRecoverPasswordEmailPostApiResponse =
  /** status 200 Successful Response */ any;
export type RecoverApiAuthRecoverPasswordEmailPostApiArg = string;
export type ResetApiAuthResetPasswordPostApiResponse =
  /** status 200 Successful Response */ any;
export type ResetApiAuthResetPasswordPostApiArg =
  BodyResetApiAuthResetPasswordPost;
export type ReadManyApiTransactionDeserialisersGetApiResponse =
  /** status 200 Successful Response */ TransactionDeserialiserApiOut[];
export type ReadManyApiTransactionDeserialisersGetApiArg = void;
export type CreateApiTransactionDeserialisersPostApiResponse =
  /** status 200 Successful Response */ TransactionDeserialiserApiOut;
export type CreateApiTransactionDeserialisersPostApiArg =
  TransactionDeserialiserApiIn;
export type ReadApiTransactionDeserialisersIdGetApiResponse =
  /** status 200 Successful Response */ TransactionDeserialiserApiOut;
export type ReadApiTransactionDeserialisersIdGetApiArg = number;
export type UpdateApiTransactionDeserialisersIdPutApiResponse =
  /** status 200 Successful Response */ TransactionDeserialiserApiOut;
export type UpdateApiTransactionDeserialisersIdPutApiArg = {
  id: number;
  transactionDeserialiserApiIn: TransactionDeserialiserApiIn;
};
export type DeleteApiTransactionDeserialisersIdDeleteApiResponse =
  /** status 200 Successful Response */ any;
export type DeleteApiTransactionDeserialisersIdDeleteApiArg = number;
export type SignupApiUsersSignupPostApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type SignupApiUsersSignupPostApiArg = UserApiIn;
export type ReadMeApiUsersMeGetApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type ReadMeApiUsersMeGetApiArg = void;
export type UpdateMeApiUsersMePutApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type UpdateMeApiUsersMePutApiArg = UserApiIn;
export type ReadApiUsersIdGetApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type ReadApiUsersIdGetApiArg = number;
export type UpdateApiUsersIdPutApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type UpdateApiUsersIdPutApiArg = {
  id: number;
  userApiIn: UserApiIn;
};
export type DeleteApiUsersIdDeleteApiResponse =
  /** status 200 Successful Response */ any;
export type DeleteApiUsersIdDeleteApiArg = number;
export type ReadManyApiUsersGetApiResponse =
  /** status 200 Successful Response */ UserApiOut[];
export type ReadManyApiUsersGetApiArg = {
  skip?: number;
  limit?: number;
};
export type CreateApiUsersPostApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type CreateApiUsersPostApiArg = UserApiIn;
export type ReadManyApiInstitutionsGetApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut[];
export type ReadManyApiInstitutionsGetApiArg = void;
export type CreateApiInstitutionsPostApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type CreateApiInstitutionsPostApiArg = InstitutionApiIn;
export type ReadApiInstitutionsIdGetApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type ReadApiInstitutionsIdGetApiArg = number;
export type UpdateApiInstitutionsIdPutApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type UpdateApiInstitutionsIdPutApiArg = {
  id: number;
  institutionApiIn: InstitutionApiIn;
};
export type DeleteApiInstitutionsIdDeleteApiResponse =
  /** status 200 Successful Response */ any;
export type DeleteApiInstitutionsIdDeleteApiArg = number;
export type ReadManyApiInstitutionLinksGetApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut[];
export type ReadManyApiInstitutionLinksGetApiArg = void;
export type CreateApiInstitutionLinksPostApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type CreateApiInstitutionLinksPostApiArg = InstitutionLinkApiIn;
export type ReadAccountsApiInstitutionLinksIdAccountsGetApiResponse =
  /** status 200 Successful Response */ AccountApiOut[];
export type ReadAccountsApiInstitutionLinksIdAccountsGetApiArg = number;
export type ReadApiInstitutionLinksIdGetApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type ReadApiInstitutionLinksIdGetApiArg = number;
export type UpdateApiInstitutionLinksIdPutApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type UpdateApiInstitutionLinksIdPutApiArg = {
  id: number;
  institutionLinkApiIn: InstitutionLinkApiIn;
};
export type DeleteApiInstitutionLinksIdDeleteApiResponse =
  /** status 200 Successful Response */ null;
export type DeleteApiInstitutionLinksIdDeleteApiArg = number;
export type SyncApiInstitutionLinksIdSyncPostApiResponse =
  /** status 200 Successful Response */ null;
export type SyncApiInstitutionLinksIdSyncPostApiArg = number;
export type ReadManyApiAccountsGetApiResponse =
  /** status 200 Successful Response */ AccountApiOut[];
export type ReadManyApiAccountsGetApiArg = void;
export type CreateApiAccountsPostApiResponse =
  /** status 200 Successful Response */ AccountApiOut;
export type CreateApiAccountsPostApiArg = AccountApiIn;
export type ReadApiAccountsIdGetApiResponse =
  /** status 200 Successful Response */ AccountApiOut;
export type ReadApiAccountsIdGetApiArg = number;
export type UpdateApiAccountsIdPutApiResponse =
  /** status 200 Successful Response */ AccountApiOut;
export type UpdateApiAccountsIdPutApiArg = {
  id: number;
  accountApiIn: AccountApiIn;
};
export type DeleteApiAccountsIdDeleteApiResponse =
  /** status 200 Successful Response */ any;
export type DeleteApiAccountsIdDeleteApiArg = number;
export type UploadTransactionsSheetApiAccountsIdTransactionsSheetPostApiResponse =
  /** status 200 Successful Response */ TransactionApiIn[];
export type UploadTransactionsSheetApiAccountsIdTransactionsSheetPostApiArg = {
  id: number;
  bodyUploadTransactionsSheetApiAccountsIdTransactionsSheetPost: BodyUploadTransactionsSheetApiAccountsIdTransactionsSheetPost;
};
export type ReadManyApiTransactionsGetApiResponse =
  /** status 200 Successful Response */ TransactionApiOut[];
export type ReadManyApiTransactionsGetApiArg = {
  page?: number;
  perPage?: number;
};
export type CreateApiTransactionsPostApiResponse =
  /** status 200 Successful Response */ TransactionApiOut[];
export type CreateApiTransactionsPostApiArg = TransactionApiIn[];
export type ReadApiTransactionsIdGetApiResponse =
  /** status 200 Successful Response */ TransactionApiOut;
export type ReadApiTransactionsIdGetApiArg = number;
export type UpdateApiTransactionsIdPutApiResponse =
  /** status 200 Successful Response */ TransactionApiOut;
export type UpdateApiTransactionsIdPutApiArg = {
  id: number;
  transactionApiIn: TransactionApiIn;
};
export type DeleteApiTransactionsIdDeleteApiResponse =
  /** status 200 Successful Response */ any;
export type DeleteApiTransactionsIdDeleteApiArg = number;
export type TestCeleryApiUtilsTestCeleryPostApiResponse =
  /** status 201 Successful Response */ string;
export type TestCeleryApiUtilsTestCeleryPostApiArg = string;
export type TestEmailApiUtilsTestEmailPostApiResponse =
  /** status 201 Successful Response */ string;
export type TestEmailApiUtilsTestEmailPostApiArg = string;
export type GetLinkTokenApiPlaidLinkTokenGetApiResponse =
  /** status 200 Successful Response */ string;
export type GetLinkTokenApiPlaidLinkTokenGetApiArg = void;
export type SetPublicTokenApiPlaidPublicTokenPostApiResponse =
  /** status 200 Successful Response */ any;
export type SetPublicTokenApiPlaidPublicTokenPostApiArg = {
  publicToken: string;
  institutionPlaidId: string;
};
export type Token = {
  access_token: string;
  token_type: string;
};
export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};
export type HttpValidationError = {
  detail?: ValidationError[];
};
export type BodyLoginApiAuthLoginPost = {
  grant_type?: string;
  username: string;
  password: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
};
export type BodyResetApiAuthResetPasswordPost = {
  token: string;
  new_password: string;
};
export type TransactionDeserialiserApiOut = {
  id: number;
  module_name: string;
  amount_deserialiser: string;
  datetime_deserialiser: string;
  name_deserialiser: string;
  currency_code_deserialiser: string;
  payment_channel_deserialiser: string;
  code_deserialiser: string;
  skip_rows: number;
  columns: number;
};
export type TransactionDeserialiserApiIn = {
  module_name: string;
  amount_deserialiser: string;
  datetime_deserialiser: string;
  name_deserialiser: string;
  currency_code_deserialiser: string;
  payment_channel_deserialiser: string;
  code_deserialiser: string;
  skip_rows: number;
  columns: number;
};
export type UserApiOut = {
  id: number;
  email: string;
  full_name: string;
  is_superuser: boolean;
};
export type UserApiIn = {
  email: string;
  full_name: string;
  is_superuser: boolean;
  password: string;
};
export type InstitutionApiOut = {
  id: number;
  name: string;
  country_code: string;
  url?: string;
  transaction_deserialiser_id?: number;
};
export type InstitutionApiIn = {
  name: string;
  country_code: string;
  url: string;
  transaction_deserialiser_id?: number;
};
export type UserInstitutionLinkApiOut = {
  id: number;
  user_id: number;
  institution_id: number;
  is_synced: boolean;
};
export type InstitutionLinkApiIn = {
  institution_id: number;
};
export type AccountType =
  | "investment"
  | "credit"
  | "depository"
  | "loan"
  | "brokerage"
  | "other";
export type AccountApiOut = {
  id: number;
  currency_code: string;
  type: AccountType;
  user_institution_link_id: number;
  balance: number;
  name: string;
  mask: string;
};
export type AccountApiIn = {
  currency_code: string;
  type: AccountType;
  user_institution_link_id: number;
  balance: number;
  name: string;
  mask: string;
};
export type PaymentChannel = "online" | "in store" | "other";
export type TransactionCode =
  | "adjustment"
  | "atm"
  | "bank charge"
  | "bill payment"
  | "cash"
  | "cashback"
  | "cheque"
  | "direct debit"
  | "interest"
  | "purchase"
  | "standing order"
  | "transfer"
  | "null";
export type TransactionApiIn = {
  amount: number;
  datetime: string;
  name: string;
  currency_code: string;
  account_id: number;
  payment_channel: PaymentChannel;
  code: TransactionCode;
};
export type BodyUploadTransactionsSheetApiAccountsIdTransactionsSheetPost = {
  file: Blob;
};
export type TransactionApiOut = {
  id: number;
  amount: number;
  datetime?: string;
  name: string;
  currency_code: string;
  account_id: number;
  payment_channel: PaymentChannel;
  code?: TransactionCode;
};
