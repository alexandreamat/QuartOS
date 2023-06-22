import { emptySplitApi as api } from "./emptyApi";
export const addTagTypes = [
  "auth",
  "transaction-deserialisers",
  "users",
  "exchangerate",
  "institutions",
  "institution-links",
  "accounts",
  "movements",
  "transactions",
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
      readExchangeRateApiExchangerateGet: build.query<
        ReadExchangeRateApiExchangerateGetApiResponse,
        ReadExchangeRateApiExchangerateGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/exchangerate/`,
          params: {
            from_currency: queryArg.fromCurrency,
            to_currency: queryArg.toCurrency,
            date: queryArg.date,
          },
        }),
        providesTags: ["exchangerate"],
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
      syncApiInstitutionsIdSyncPost: build.mutation<
        SyncApiInstitutionsIdSyncPostApiResponse,
        SyncApiInstitutionsIdSyncPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/institutions/${queryArg}/sync`,
          method: "POST",
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
          body: queryArg.userInstitutionLinkApiIn,
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
      readTransactionsApiAccountsIdTransactionsGet: build.query<
        ReadTransactionsApiAccountsIdTransactionsGetApiResponse,
        ReadTransactionsApiAccountsIdTransactionsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/accounts/${queryArg.id}/transactions`,
          params: {
            page: queryArg.page,
            per_page: queryArg.perPage,
            timestamp: queryArg.timestamp,
            search: queryArg.search,
            is_descending: queryArg.isDescending,
          },
        }),
        providesTags: ["accounts"],
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
      updateBalancesApiAccountsUpdateBalancesPost: build.mutation<
        UpdateBalancesApiAccountsUpdateBalancesPostApiResponse,
        UpdateBalancesApiAccountsUpdateBalancesPostApiArg
      >({
        query: () => ({ url: `/api/accounts/update-balances`, method: "POST" }),
        invalidatesTags: ["accounts"],
      }),
      readTransactionsApiMovementsIdTransactionsGet: build.query<
        ReadTransactionsApiMovementsIdTransactionsGetApiResponse,
        ReadTransactionsApiMovementsIdTransactionsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/movements/${queryArg}/transactions`,
        }),
        providesTags: ["movements"],
      }),
      readApiMovementsIdGet: build.query<
        ReadApiMovementsIdGetApiResponse,
        ReadApiMovementsIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/api/movements/${queryArg}` }),
        providesTags: ["movements"],
      }),
      deleteApiMovementsIdDelete: build.mutation<
        DeleteApiMovementsIdDeleteApiResponse,
        DeleteApiMovementsIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/movements/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["movements"],
      }),
      updateApiMovementsIdPatch: build.mutation<
        UpdateApiMovementsIdPatchApiResponse,
        UpdateApiMovementsIdPatchApiArg
      >({
        query: (queryArg) => ({
          url: `/api/movements/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.body,
        }),
        invalidatesTags: ["movements"],
      }),
      readManyApiMovementsGet: build.query<
        ReadManyApiMovementsGetApiResponse,
        ReadManyApiMovementsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/movements/`,
          params: {
            page: queryArg.page,
            per_page: queryArg.perPage,
            search: queryArg.search,
          },
        }),
        providesTags: ["movements"],
      }),
      createApiMovementsPost: build.mutation<
        CreateApiMovementsPostApiResponse,
        CreateApiMovementsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/movements/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["movements"],
      }),
      readManyApiTransactionsGet: build.query<
        ReadManyApiTransactionsGetApiResponse,
        ReadManyApiTransactionsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/transactions/`,
          params: {
            page: queryArg.page,
            per_page: queryArg.perPage,
            timestamp: queryArg.timestamp,
            search: queryArg.search,
            ids: queryArg.ids,
            is_descending: queryArg.isDescending,
          },
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
export type ReadExchangeRateApiExchangerateGetApiResponse =
  /** status 200 Successful Response */ number;
export type ReadExchangeRateApiExchangerateGetApiArg = {
  fromCurrency: string;
  toCurrency: string;
  date: string;
};
export type ReadManyApiInstitutionsGetApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut[];
export type ReadManyApiInstitutionsGetApiArg = void;
export type CreateApiInstitutionsPostApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type CreateApiInstitutionsPostApiArg = InstitutionApiIn;
export type SyncApiInstitutionsIdSyncPostApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type SyncApiInstitutionsIdSyncPostApiArg = number;
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
export type CreateApiInstitutionLinksPostApiArg = UserInstitutionLinkApiIn;
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
  userInstitutionLinkApiIn: UserInstitutionLinkApiIn;
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
  /** status 200 Successful Response */ null;
export type DeleteApiAccountsIdDeleteApiArg = number;
export type ReadTransactionsApiAccountsIdTransactionsGetApiResponse =
  /** status 200 Successful Response */ TransactionApiOut[];
export type ReadTransactionsApiAccountsIdTransactionsGetApiArg = {
  id: number;
  page?: number;
  perPage?: number;
  timestamp?: string;
  search?: string;
  isDescending?: boolean;
};
export type UploadTransactionsSheetApiAccountsIdTransactionsSheetPostApiResponse =
  /** status 200 Successful Response */ TransactionApiIn[];
export type UploadTransactionsSheetApiAccountsIdTransactionsSheetPostApiArg = {
  id: number;
  bodyUploadTransactionsSheetApiAccountsIdTransactionsSheetPost: BodyUploadTransactionsSheetApiAccountsIdTransactionsSheetPost;
};
export type UpdateBalancesApiAccountsUpdateBalancesPostApiResponse =
  /** status 200 Successful Response */ null;
export type UpdateBalancesApiAccountsUpdateBalancesPostApiArg = void;
export type ReadTransactionsApiMovementsIdTransactionsGetApiResponse =
  /** status 200 Successful Response */ TransactionApiOut[];
export type ReadTransactionsApiMovementsIdTransactionsGetApiArg = number;
export type ReadApiMovementsIdGetApiResponse =
  /** status 200 Successful Response */ MovementApiOut;
export type ReadApiMovementsIdGetApiArg = number;
export type DeleteApiMovementsIdDeleteApiResponse =
  /** status 200 Successful Response */ null;
export type DeleteApiMovementsIdDeleteApiArg = number;
export type UpdateApiMovementsIdPatchApiResponse =
  /** status 200 Successful Response */ MovementApiOut;
export type UpdateApiMovementsIdPatchApiArg = {
  id: number;
  body: number[];
};
export type ReadManyApiMovementsGetApiResponse =
  /** status 200 Successful Response */ MovementApiOut[];
export type ReadManyApiMovementsGetApiArg = {
  page?: number;
  perPage?: number;
  search?: string;
};
export type CreateApiMovementsPostApiResponse =
  /** status 200 Successful Response */ MovementApiOut;
export type CreateApiMovementsPostApiArg = number[];
export type ReadManyApiTransactionsGetApiResponse =
  /** status 200 Successful Response */ TransactionApiOut[];
export type ReadManyApiTransactionsGetApiArg = {
  page?: number;
  perPage?: number;
  timestamp?: string;
  search?: string;
  ids?: string;
  isDescending?: boolean;
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
  timestamp_deserialiser: string;
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
  timestamp_deserialiser: string;
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
  transactiondeserialiser_id?: number;
  colour?: string;
  logo_base64?: string;
};
export type InstitutionApiIn = {
  name: string;
  country_code: string;
  url: string;
  transactiondeserialiser_id?: number;
  colour?: string;
};
export type UserInstitutionLinkApiOut = {
  id: number;
  institution_id: number;
  user_id: number;
  is_synced: boolean;
};
export type UserInstitutionLinkApiIn = {
  institution_id: number;
  user_id?: number;
};
export type InstitutionalAccountType =
  | "investment"
  | "credit"
  | "depository"
  | "loan"
  | "brokerage"
  | "other";
export type InstitutionalAccount = {
  id: number;
  userinstitutionlink_id: number;
  type: InstitutionalAccountType;
  mask: string;
};
export type NonInstitutionalAccountType =
  | "personal ledger"
  | "cash"
  | "property";
export type NonInstitutionalAccount = {
  id: number;
  type: NonInstitutionalAccountType;
  user_id: number;
};
export type AccountApiOut = {
  id: number;
  currency_code: string;
  initial_balance: number;
  name: string;
  institutionalaccount?: InstitutionalAccount;
  noninstitutionalaccount?: NonInstitutionalAccount;
  is_synced: boolean;
  balance: number;
};
export type InstitutionalAccount2 = {
  userinstitutionlink_id: number;
  type: InstitutionalAccountType;
  mask: string;
};
export type NonInstitutionalAccount2 = {
  type: NonInstitutionalAccountType;
  user_id?: number;
};
export type AccountApiIn = {
  currency_code: string;
  initial_balance: number;
  name: string;
  institutionalaccount?: InstitutionalAccount2;
  noninstitutionalaccount?: NonInstitutionalAccount2;
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
export type TransactionApiOut = {
  id: number;
  amount: number;
  timestamp: string;
  name: string;
  currency_code: string;
  account_id: number;
  movement_id?: number;
  payment_channel: PaymentChannel;
  code?: TransactionCode;
  account_balance: number;
};
export type TransactionApiIn = {
  amount: number;
  timestamp: string;
  name: string;
  currency_code: string;
  account_id: number;
  movement_id?: number;
  payment_channel: PaymentChannel;
  code?: TransactionCode;
  account_balance?: number;
};
export type BodyUploadTransactionsSheetApiAccountsIdTransactionsSheetPost = {
  file: Blob;
};
export type MovementApiOut = {
  id: number;
  earliest_timestamp?: string;
  latest_timestamp?: string;
  amounts: {
    [key: string]: number;
  };
};
