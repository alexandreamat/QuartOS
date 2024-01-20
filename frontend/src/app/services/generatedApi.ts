import { emptySplitApi as api } from "./emptyApi";
export const addTagTypes = [
  "auth",
  "exchangerate",
  "transaction-deserialisers",
  "replacement-patterns",
  "institutions",
  "users",
  "institution-links",
  "transactions",
  "movements",
  "accounts",
  "files",
  "categories",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      loginAuthLoginPost: build.mutation<
        LoginAuthLoginPostApiResponse,
        LoginAuthLoginPostApiArg
      >({
        query: (queryArg) => ({
          url: `/auth/login`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["auth"],
      }),
      resetAuthResetPasswordPost: build.mutation<
        ResetAuthResetPasswordPostApiResponse,
        ResetAuthResetPasswordPostApiArg
      >({
        query: (queryArg) => ({
          url: `/auth/reset-password/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["auth"],
      }),
      readExchangeRateExchangerateGet: build.query<
        ReadExchangeRateExchangerateGetApiResponse,
        ReadExchangeRateExchangerateGetApiArg
      >({
        query: (queryArg) => ({
          url: `/exchangerate/`,
          params: {
            from_currency: queryArg.fromCurrency,
            to_currency: queryArg.toCurrency,
            date: queryArg.date,
          },
        }),
        providesTags: ["exchangerate"],
      }),
      readManyTransactionDeserialisersGet: build.query<
        ReadManyTransactionDeserialisersGetApiResponse,
        ReadManyTransactionDeserialisersGetApiArg
      >({
        query: () => ({ url: `/transaction-deserialisers/` }),
        providesTags: ["transaction-deserialisers"],
      }),
      createTransactionDeserialisersPost: build.mutation<
        CreateTransactionDeserialisersPostApiResponse,
        CreateTransactionDeserialisersPostApiArg
      >({
        query: (queryArg) => ({
          url: `/transaction-deserialisers/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["transaction-deserialisers"],
      }),
      readTransactionDeserialisersIdGet: build.query<
        ReadTransactionDeserialisersIdGetApiResponse,
        ReadTransactionDeserialisersIdGetApiArg
      >({
        query: (queryArg) => ({
          url: `/transaction-deserialisers/${queryArg}`,
        }),
        providesTags: ["transaction-deserialisers"],
      }),
      updateTransactionDeserialisersIdPut: build.mutation<
        UpdateTransactionDeserialisersIdPutApiResponse,
        UpdateTransactionDeserialisersIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/transaction-deserialisers/${queryArg.id}`,
          method: "PUT",
          body: queryArg.transactionDeserialiserApiIn,
        }),
        invalidatesTags: ["transaction-deserialisers"],
      }),
      deleteTransactionDeserialisersIdDelete: build.mutation<
        DeleteTransactionDeserialisersIdDeleteApiResponse,
        DeleteTransactionDeserialisersIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/transaction-deserialisers/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["transaction-deserialisers"],
      }),
      readManyReplacementPatternsGet: build.query<
        ReadManyReplacementPatternsGetApiResponse,
        ReadManyReplacementPatternsGetApiArg
      >({
        query: () => ({ url: `/replacement-patterns/` }),
        providesTags: ["replacement-patterns"],
      }),
      createReplacementPatternsPost: build.mutation<
        CreateReplacementPatternsPostApiResponse,
        CreateReplacementPatternsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/replacement-patterns/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["replacement-patterns"],
      }),
      readReplacementPatternsIdGet: build.query<
        ReadReplacementPatternsIdGetApiResponse,
        ReadReplacementPatternsIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/replacement-patterns/${queryArg}` }),
        providesTags: ["replacement-patterns"],
      }),
      updateReplacementPatternsIdPut: build.mutation<
        UpdateReplacementPatternsIdPutApiResponse,
        UpdateReplacementPatternsIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/replacement-patterns/${queryArg.id}`,
          method: "PUT",
          body: queryArg.replacementPatternApiIn,
        }),
        invalidatesTags: ["replacement-patterns"],
      }),
      deleteReplacementPatternsIdDelete: build.mutation<
        DeleteReplacementPatternsIdDeleteApiResponse,
        DeleteReplacementPatternsIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/replacement-patterns/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["replacement-patterns"],
      }),
      createInstitutionsPost: build.mutation<
        CreateInstitutionsPostApiResponse,
        CreateInstitutionsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/institutions/`,
          method: "POST",
          body: queryArg.institutionApiIn,
          params: {
            transactiondeserialiser_id: queryArg.transactiondeserialiserId,
            replacementpattern_id: queryArg.replacementpatternId,
          },
        }),
        invalidatesTags: ["institutions"],
      }),
      readManyInstitutionsGet: build.query<
        ReadManyInstitutionsGetApiResponse,
        ReadManyInstitutionsGetApiArg
      >({
        query: () => ({ url: `/institutions/` }),
        providesTags: ["institutions"],
      }),
      readInstitutionsInstitutionIdGet: build.query<
        ReadInstitutionsInstitutionIdGetApiResponse,
        ReadInstitutionsInstitutionIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/institutions/${queryArg}` }),
        providesTags: ["institutions"],
      }),
      updateInstitutionsInstitutionIdPut: build.mutation<
        UpdateInstitutionsInstitutionIdPutApiResponse,
        UpdateInstitutionsInstitutionIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/institutions/${queryArg.institutionId}`,
          method: "PUT",
          body: queryArg.institutionApiIn,
          params: {
            transactiondeserialiser_id: queryArg.transactiondeserialiserId,
            replacementpattern_id: queryArg.replacementpatternId,
          },
        }),
        invalidatesTags: ["institutions"],
      }),
      deleteInstitutionsInstitutionIdDelete: build.mutation<
        DeleteInstitutionsInstitutionIdDeleteApiResponse,
        DeleteInstitutionsInstitutionIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/institutions/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["institutions"],
      }),
      syncInstitutionsInstitutionIdSyncPut: build.mutation<
        SyncInstitutionsInstitutionIdSyncPutApiResponse,
        SyncInstitutionsInstitutionIdSyncPutApiArg
      >({
        query: (queryArg) => ({
          url: `/institutions/${queryArg}/sync`,
          method: "PUT",
        }),
        invalidatesTags: ["institutions"],
      }),
      signupUsersSignupPost: build.mutation<
        SignupUsersSignupPostApiResponse,
        SignupUsersSignupPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/signup`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["users"],
      }),
      readMeUsersMeGet: build.query<
        ReadMeUsersMeGetApiResponse,
        ReadMeUsersMeGetApiArg
      >({
        query: () => ({ url: `/users/me` }),
        providesTags: ["users"],
      }),
      updateMeUsersMePut: build.mutation<
        UpdateMeUsersMePutApiResponse,
        UpdateMeUsersMePutApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me`,
          method: "PUT",
          body: queryArg,
        }),
        invalidatesTags: ["users"],
      }),
      readUsersUserIdGet: build.query<
        ReadUsersUserIdGetApiResponse,
        ReadUsersUserIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/users/${queryArg}` }),
        providesTags: ["users"],
      }),
      updateUsersUserIdPut: build.mutation<
        UpdateUsersUserIdPutApiResponse,
        UpdateUsersUserIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/users/${queryArg.userId}`,
          method: "PUT",
          body: queryArg.userApiIn,
        }),
        invalidatesTags: ["users"],
      }),
      deleteUsersUserIdDelete: build.mutation<
        DeleteUsersUserIdDeleteApiResponse,
        DeleteUsersUserIdDeleteApiArg
      >({
        query: (queryArg) => ({ url: `/users/${queryArg}`, method: "DELETE" }),
        invalidatesTags: ["users"],
      }),
      createUsersPost: build.mutation<
        CreateUsersPostApiResponse,
        CreateUsersPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["users"],
      }),
      readManyUsersGet: build.query<
        ReadManyUsersGetApiResponse,
        ReadManyUsersGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/`,
          params: { offset: queryArg.offset, limit: queryArg.limit },
        }),
        providesTags: ["users"],
      }),
      getLinkTokenUsersMeInstitutionLinksLinkTokenGet: build.query<
        GetLinkTokenUsersMeInstitutionLinksLinkTokenGetApiResponse,
        GetLinkTokenUsersMeInstitutionLinksLinkTokenGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institution-links/link_token`,
          params: { userinstitutionlink_id: queryArg },
        }),
        providesTags: ["users", "institution-links"],
      }),
      setPublicTokenUsersMeInstitutionLinksPublicTokenPost: build.mutation<
        SetPublicTokenUsersMeInstitutionLinksPublicTokenPostApiResponse,
        SetPublicTokenUsersMeInstitutionLinksPublicTokenPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institution-links/public_token`,
          method: "POST",
          params: {
            public_token: queryArg.publicToken,
            institution_plaid_id: queryArg.institutionPlaidId,
          },
        }),
        invalidatesTags: ["users", "institution-links"],
      }),
      resyncUsersMeInstitutionLinksResyncPost: build.mutation<
        ResyncUsersMeInstitutionLinksResyncPostApiResponse,
        ResyncUsersMeInstitutionLinksResyncPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institution-links/resync`,
          method: "POST",
          params: { userinstitutionlink_id: queryArg },
        }),
        invalidatesTags: ["users", "institution-links"],
      }),
      createUsersMeInstitutionLinksPost: build.mutation<
        CreateUsersMeInstitutionLinksPostApiResponse,
        CreateUsersMeInstitutionLinksPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institution-links/`,
          method: "POST",
          body: queryArg.userInstitutionLinkApiIn,
          params: { institution_id: queryArg.institutionId },
        }),
        invalidatesTags: ["users", "institution-links"],
      }),
      readManyUsersMeInstitutionLinksGet: build.query<
        ReadManyUsersMeInstitutionLinksGetApiResponse,
        ReadManyUsersMeInstitutionLinksGetApiArg
      >({
        query: () => ({ url: `/users/me/institution-links/` }),
        providesTags: ["users", "institution-links"],
      }),
      readUsersMeInstitutionLinksUserinstitutionlinkIdGet: build.query<
        ReadUsersMeInstitutionLinksUserinstitutionlinkIdGetApiResponse,
        ReadUsersMeInstitutionLinksUserinstitutionlinkIdGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institution-links/${queryArg}`,
        }),
        providesTags: ["users", "institution-links"],
      }),
      updateUsersMeInstitutionLinksUserinstitutionlinkIdPut: build.mutation<
        UpdateUsersMeInstitutionLinksUserinstitutionlinkIdPutApiResponse,
        UpdateUsersMeInstitutionLinksUserinstitutionlinkIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institution-links/${queryArg.userinstitutionlinkId}`,
          method: "PUT",
          body: queryArg.userInstitutionLinkApiIn,
        }),
        invalidatesTags: ["users", "institution-links"],
      }),
      deleteUsersMeInstitutionLinksUserinstitutionlinkIdDelete: build.mutation<
        DeleteUsersMeInstitutionLinksUserinstitutionlinkIdDeleteApiResponse,
        DeleteUsersMeInstitutionLinksUserinstitutionlinkIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institution-links/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["users", "institution-links"],
      }),
      readManyUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidStartDateEndDateGet:
        build.query<
          ReadManyUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidStartDateEndDateGetApiResponse,
          ReadManyUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidStartDateEndDateGetApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/institution-links/${queryArg.userinstitutionlinkId}/transactions/plaid/${queryArg.startDate}/${queryArg.endDate}`,
          }),
          providesTags: ["users", "institution-links", "transactions"],
        }),
      resetManyUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResetPut:
        build.mutation<
          ResetManyUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResetPutApiResponse,
          ResetManyUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResetPutApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/institution-links/${queryArg}/transactions/plaid/reset`,
            method: "PUT",
          }),
          invalidatesTags: ["users", "institution-links", "transactions"],
        }),
      resetUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidTransactionIdResetPut:
        build.mutation<
          ResetUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidTransactionIdResetPutApiResponse,
          ResetUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidTransactionIdResetPutApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/institution-links/${queryArg.userinstitutionlinkId}/transactions/plaid/${queryArg.transactionId}/reset`,
            method: "PUT",
          }),
          invalidatesTags: ["users", "institution-links", "transactions"],
        }),
      syncUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidSyncPost:
        build.mutation<
          SyncUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidSyncPostApiResponse,
          SyncUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidSyncPostApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/institution-links/${queryArg}/transactions/plaid/sync`,
            method: "POST",
          }),
          invalidatesTags: ["users", "institution-links", "transactions"],
        }),
      resyncUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResyncStartDateEndDatePut:
        build.mutation<
          ResyncUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResyncStartDateEndDatePutApiResponse,
          ResyncUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResyncStartDateEndDatePutApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/institution-links/${queryArg.userinstitutionlinkId}/transactions/plaid/resync/${queryArg.startDate}/${queryArg.endDate}`,
            method: "PUT",
            params: { dry_run: queryArg.dryRun },
          }),
          invalidatesTags: ["users", "institution-links", "transactions"],
        }),
      createUsersMeMovementsPost: build.mutation<
        CreateUsersMeMovementsPostApiResponse,
        CreateUsersMeMovementsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/movements/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["users", "movements"],
      }),
      readManyUsersMeMovementsGet: build.query<
        ReadManyUsersMeMovementsGetApiResponse,
        ReadManyUsersMeMovementsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/movements/`,
          params: {
            userinstitutionlink_id: queryArg.userinstitutionlinkId,
            account_id: queryArg.accountId,
            page: queryArg.page,
            per_page: queryArg.perPage,
            start_date: queryArg.startDate,
            end_date: queryArg.endDate,
            search: queryArg.search,
            transaction_amount_ge: queryArg.transactionAmountGe,
            transaction_amount_le: queryArg.transactionAmountLe,
            is_amount_abs: queryArg.isAmountAbs,
            transactionsGe: queryArg.transactionsGe,
            transactionsLe: queryArg.transactionsLe,
            is_descending: queryArg.isDescending,
            sort_by: queryArg.sortBy,
          },
        }),
        providesTags: ["users", "movements"],
      }),
      readUsersMeMovementsMovementIdGet: build.query<
        ReadUsersMeMovementsMovementIdGetApiResponse,
        ReadUsersMeMovementsMovementIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/users/me/movements/${queryArg}` }),
        providesTags: ["users", "movements"],
      }),
      updateUsersMeMovementsMovementIdPut: build.mutation<
        UpdateUsersMeMovementsMovementIdPutApiResponse,
        UpdateUsersMeMovementsMovementIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/movements/${queryArg.movementId}`,
          method: "PUT",
          body: queryArg.movementApiIn,
        }),
        invalidatesTags: ["users", "movements"],
      }),
      deleteUsersMeMovementsMovementIdDelete: build.mutation<
        DeleteUsersMeMovementsMovementIdDeleteApiResponse,
        DeleteUsersMeMovementsMovementIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/movements/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["users", "movements"],
      }),
      addTransactionsUsersMeMovementsMovementIdTransactionsPut: build.mutation<
        AddTransactionsUsersMeMovementsMovementIdTransactionsPutApiResponse,
        AddTransactionsUsersMeMovementsMovementIdTransactionsPutApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/movements/${queryArg.movementId}/transactions/`,
          method: "PUT",
          body: queryArg.body,
        }),
        invalidatesTags: ["users", "movements"],
      }),
      readExpensesUsersMeMovementsAggregatesStartDateEndDateExpensesGet:
        build.query<
          ReadExpensesUsersMeMovementsAggregatesStartDateEndDateExpensesGetApiResponse,
          ReadExpensesUsersMeMovementsAggregatesStartDateEndDateExpensesGetApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/movements/aggregates/${queryArg.startDate}/${queryArg.endDate}/expenses`,
          }),
          providesTags: ["users", "movements"],
        }),
      readIncomeUsersMeMovementsAggregatesStartDateEndDateIncomeGet:
        build.query<
          ReadIncomeUsersMeMovementsAggregatesStartDateEndDateIncomeGetApiResponse,
          ReadIncomeUsersMeMovementsAggregatesStartDateEndDateIncomeGetApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/movements/aggregates/${queryArg.startDate}/${queryArg.endDate}/income`,
          }),
          providesTags: ["users", "movements"],
        }),
      getAggregateUsersMeMovementsAggregatesStartDateGet: build.query<
        GetAggregateUsersMeMovementsAggregatesStartDateGetApiResponse,
        GetAggregateUsersMeMovementsAggregatesStartDateGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/movements/aggregates/${queryArg}`,
        }),
        providesTags: ["users", "movements"],
      }),
      getManyAggregatesUsersMeMovementsAggregatesGet: build.query<
        GetManyAggregatesUsersMeMovementsAggregatesGetApiResponse,
        GetManyAggregatesUsersMeMovementsAggregatesGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/movements/aggregates/`,
          params: { page: queryArg.page, per_page: queryArg.perPage },
        }),
        providesTags: ["users", "movements"],
      }),
      readManyUsersMeTransactionsGet: build.query<
        ReadManyUsersMeTransactionsGetApiResponse,
        ReadManyUsersMeTransactionsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/transactions/`,
          params: {
            account_id: queryArg.accountId,
            page: queryArg.page,
            per_page: queryArg.perPage,
            timestamp_ge: queryArg.timestampGe,
            timestamp_le: queryArg.timestampLe,
            search: queryArg.search,
            is_descending: queryArg.isDescending,
            amount_ge: queryArg.amountGe,
            amount_le: queryArg.amountLe,
            is_amount_abs: queryArg.isAmountAbs,
          },
        }),
        providesTags: ["users", "transactions"],
      }),
      readManyUsersMeAccountsGet: build.query<
        ReadManyUsersMeAccountsGetApiResponse,
        ReadManyUsersMeAccountsGetApiArg
      >({
        query: () => ({ url: `/users/me/accounts/` }),
        providesTags: ["users", "accounts"],
      }),
      createUsersMeAccountsPost: build.mutation<
        CreateUsersMeAccountsPostApiResponse,
        CreateUsersMeAccountsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/accounts/`,
          method: "POST",
          body: queryArg.accountApiIn,
          params: { userinstitutionlink_id: queryArg.userinstitutionlinkId },
        }),
        invalidatesTags: ["users", "accounts"],
      }),
      previewUsersMeAccountsPreviewPost: build.mutation<
        PreviewUsersMeAccountsPreviewPostApiResponse,
        PreviewUsersMeAccountsPreviewPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/accounts/preview`,
          method: "POST",
          body: queryArg.bodyPreviewUsersMeAccountsPreviewPost,
          params: { account_id: queryArg.accountId },
        }),
        invalidatesTags: ["users", "accounts"],
      }),
      readUsersMeAccountsAccountIdGet: build.query<
        ReadUsersMeAccountsAccountIdGetApiResponse,
        ReadUsersMeAccountsAccountIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/users/me/accounts/${queryArg}` }),
        providesTags: ["users", "accounts"],
      }),
      updateUsersMeAccountsAccountIdPut: build.mutation<
        UpdateUsersMeAccountsAccountIdPutApiResponse,
        UpdateUsersMeAccountsAccountIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/accounts/${queryArg.accountId}`,
          method: "PUT",
          body: queryArg.accountApiIn,
          params: { userinstitutionlink_id: queryArg.userinstitutionlinkId },
        }),
        invalidatesTags: ["users", "accounts"],
      }),
      deleteUsersMeAccountsAccountIdDelete: build.mutation<
        DeleteUsersMeAccountsAccountIdDeleteApiResponse,
        DeleteUsersMeAccountsAccountIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/accounts/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["users", "accounts"],
      }),
      updateBalanceUsersMeAccountsAccountIdUpdateBalancePut: build.mutation<
        UpdateBalanceUsersMeAccountsAccountIdUpdateBalancePutApiResponse,
        UpdateBalanceUsersMeAccountsAccountIdUpdateBalancePutApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/accounts/${queryArg}/update-balance`,
          method: "PUT",
        }),
        invalidatesTags: ["users", "accounts"],
      }),
      updateTransactionsAmountDefaultCurrencyUsersMeAccountsAccountIdUpdateTransactionsAmountDefaultCurrencyPut:
        build.mutation<
          UpdateTransactionsAmountDefaultCurrencyUsersMeAccountsAccountIdUpdateTransactionsAmountDefaultCurrencyPutApiResponse,
          UpdateTransactionsAmountDefaultCurrencyUsersMeAccountsAccountIdUpdateTransactionsAmountDefaultCurrencyPutApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg}/update-transactions-amount-default-currency`,
            method: "PUT",
          }),
          invalidatesTags: ["users", "accounts"],
        }),
      createManyUsersMeAccountsAccountIdMovementsPost: build.mutation<
        CreateManyUsersMeAccountsAccountIdMovementsPostApiResponse,
        CreateManyUsersMeAccountsAccountIdMovementsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/accounts/${queryArg.accountId}/movements/`,
          method: "POST",
          body: queryArg.bodyCreateManyUsersMeAccountsAccountIdMovementsPost,
        }),
        invalidatesTags: ["users", "accounts", "movements"],
      }),
      createUsersMeAccountsAccountIdMovementsMovementIdTransactionsPost:
        build.mutation<
          CreateUsersMeAccountsAccountIdMovementsMovementIdTransactionsPostApiResponse,
          CreateUsersMeAccountsAccountIdMovementsMovementIdTransactionsPostApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg.accountId}/movements/${queryArg.movementId}/transactions/`,
            method: "POST",
            body: queryArg.transactionApiInInput,
          }),
          invalidatesTags: ["users", "accounts", "movements", "transactions"],
        }),
      readUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdGet:
        build.query<
          ReadUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdGetApiResponse,
          ReadUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdGetApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg.accountId}/movements/${queryArg.movementId}/transactions/${queryArg.transactionId}`,
          }),
          providesTags: ["users", "accounts", "movements", "transactions"],
        }),
      updateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPut:
        build.mutation<
          UpdateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPutApiResponse,
          UpdateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPutApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg.accountId}/movements/${queryArg.movementId}/transactions/${queryArg.transactionId}`,
            method: "PUT",
            body: queryArg.transactionApiInInput,
            params: { new_movement_id: queryArg.newMovementId },
          }),
          invalidatesTags: ["users", "accounts", "movements", "transactions"],
        }),
      deleteUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDelete:
        build.mutation<
          DeleteUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDeleteApiResponse,
          DeleteUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDeleteApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg.accountId}/movements/${queryArg.movementId}/transactions/${queryArg.transactionId}`,
            method: "DELETE",
          }),
          invalidatesTags: ["users", "accounts", "movements", "transactions"],
        }),
      createUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPost:
        build.mutation<
          CreateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPostApiResponse,
          CreateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPostApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg.accountId}/movements/${queryArg.movementId}/transactions/${queryArg.transactionId}/files/`,
            method: "POST",
            body: queryArg.bodyCreateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPost,
          }),
          invalidatesTags: [
            "users",
            "accounts",
            "movements",
            "transactions",
            "files",
          ],
        }),
      readManyUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesGet:
        build.query<
          ReadManyUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesGetApiResponse,
          ReadManyUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesGetApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg.accountId}/movements/${queryArg.movementId}/transactions/${queryArg.transactionId}/files/`,
          }),
          providesTags: [
            "users",
            "accounts",
            "movements",
            "transactions",
            "files",
          ],
        }),
      readUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdGet:
        build.query<
          ReadUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdGetApiResponse,
          ReadUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdGetApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg.accountId}/movements/${queryArg.movementId}/transactions/${queryArg.transactionId}/files/${queryArg.fileId}`,
          }),
          providesTags: [
            "users",
            "accounts",
            "movements",
            "transactions",
            "files",
          ],
        }),
      deleteUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdDelete:
        build.mutation<
          DeleteUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdDeleteApiResponse,
          DeleteUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdDeleteApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg.accountId}/movements/${queryArg.movementId}/transactions/${queryArg.transactionId}/files/${queryArg.fileId}`,
            method: "DELETE",
          }),
          invalidatesTags: [
            "users",
            "accounts",
            "movements",
            "transactions",
            "files",
          ],
        }),
      updateBalancesAccountsUpdateBalancesPost: build.mutation<
        UpdateBalancesAccountsUpdateBalancesPostApiResponse,
        UpdateBalancesAccountsUpdateBalancesPostApiArg
      >({
        query: () => ({ url: `/accounts/update-balances`, method: "POST" }),
        invalidatesTags: ["accounts"],
      }),
      readPlaidTransactionsPlaidIdGet: build.query<
        ReadPlaidTransactionsPlaidIdGetApiResponse,
        ReadPlaidTransactionsPlaidIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/transactions/plaid/${queryArg}` }),
        providesTags: ["transactions"],
      }),
      updatePlaidTransactionsPlaidIdPut: build.mutation<
        UpdatePlaidTransactionsPlaidIdPutApiResponse,
        UpdatePlaidTransactionsPlaidIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/transactions/plaid/${queryArg.id}`,
          method: "PUT",
          body: queryArg.transactionPlaidInInput,
        }),
        invalidatesTags: ["transactions"],
      }),
      readManyCategoriesGet: build.query<
        ReadManyCategoriesGetApiResponse,
        ReadManyCategoriesGetApiArg
      >({
        query: () => ({ url: `/categories/` }),
        providesTags: ["categories"],
      }),
      readCategoriesCategoryIdGet: build.query<
        ReadCategoriesCategoryIdGetApiResponse,
        ReadCategoriesCategoryIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/categories/${queryArg}` }),
        providesTags: ["categories"],
      }),
      getAllCategoriesPlaidGetAllPut: build.mutation<
        GetAllCategoriesPlaidGetAllPutApiResponse,
        GetAllCategoriesPlaidGetAllPutApiArg
      >({
        query: () => ({ url: `/categories/plaid/get-all`, method: "PUT" }),
        invalidatesTags: ["categories"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedApi };
export type LoginAuthLoginPostApiResponse =
  /** status 200 Successful Response */ Token;
export type LoginAuthLoginPostApiArg = BodyLoginAuthLoginPost;
export type ResetAuthResetPasswordPostApiResponse =
  /** status 200 Successful Response */ any;
export type ResetAuthResetPasswordPostApiArg = BodyResetAuthResetPasswordPost;
export type ReadExchangeRateExchangerateGetApiResponse =
  /** status 200 Successful Response */ string;
export type ReadExchangeRateExchangerateGetApiArg = {
  fromCurrency: string;
  toCurrency: string;
  date: string;
};
export type ReadManyTransactionDeserialisersGetApiResponse =
  /** status 200 Successful Response */ TransactionDeserialiserApiOut[];
export type ReadManyTransactionDeserialisersGetApiArg = void;
export type CreateTransactionDeserialisersPostApiResponse =
  /** status 200 Successful Response */ TransactionDeserialiserApiOut;
export type CreateTransactionDeserialisersPostApiArg =
  TransactionDeserialiserApiIn;
export type ReadTransactionDeserialisersIdGetApiResponse =
  /** status 200 Successful Response */ TransactionDeserialiserApiOut;
export type ReadTransactionDeserialisersIdGetApiArg = number;
export type UpdateTransactionDeserialisersIdPutApiResponse =
  /** status 200 Successful Response */ TransactionDeserialiserApiOut;
export type UpdateTransactionDeserialisersIdPutApiArg = {
  id: number;
  transactionDeserialiserApiIn: TransactionDeserialiserApiIn;
};
export type DeleteTransactionDeserialisersIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteTransactionDeserialisersIdDeleteApiArg = number;
export type ReadManyReplacementPatternsGetApiResponse =
  /** status 200 Successful Response */ ReplacementPatternApiOut[];
export type ReadManyReplacementPatternsGetApiArg = void;
export type CreateReplacementPatternsPostApiResponse =
  /** status 200 Successful Response */ ReplacementPatternApiOut;
export type CreateReplacementPatternsPostApiArg = ReplacementPatternApiIn;
export type ReadReplacementPatternsIdGetApiResponse =
  /** status 200 Successful Response */ ReplacementPatternApiOut;
export type ReadReplacementPatternsIdGetApiArg = number;
export type UpdateReplacementPatternsIdPutApiResponse =
  /** status 200 Successful Response */ ReplacementPatternApiOut;
export type UpdateReplacementPatternsIdPutApiArg = {
  id: number;
  replacementPatternApiIn: ReplacementPatternApiIn;
};
export type DeleteReplacementPatternsIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteReplacementPatternsIdDeleteApiArg = number;
export type CreateInstitutionsPostApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type CreateInstitutionsPostApiArg = {
  transactiondeserialiserId?: number | null;
  replacementpatternId?: number | null;
  institutionApiIn: InstitutionApiIn;
};
export type ReadManyInstitutionsGetApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut[];
export type ReadManyInstitutionsGetApiArg = void;
export type ReadInstitutionsInstitutionIdGetApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type ReadInstitutionsInstitutionIdGetApiArg = number;
export type UpdateInstitutionsInstitutionIdPutApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type UpdateInstitutionsInstitutionIdPutApiArg = {
  institutionId: number;
  transactiondeserialiserId?: number | null;
  replacementpatternId?: number | null;
  institutionApiIn: InstitutionApiIn;
};
export type DeleteInstitutionsInstitutionIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteInstitutionsInstitutionIdDeleteApiArg = number;
export type SyncInstitutionsInstitutionIdSyncPutApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type SyncInstitutionsInstitutionIdSyncPutApiArg = number;
export type SignupUsersSignupPostApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type SignupUsersSignupPostApiArg = UserApiIn;
export type ReadMeUsersMeGetApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type ReadMeUsersMeGetApiArg = void;
export type UpdateMeUsersMePutApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type UpdateMeUsersMePutApiArg = UserApiIn;
export type ReadUsersUserIdGetApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type ReadUsersUserIdGetApiArg = number;
export type UpdateUsersUserIdPutApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type UpdateUsersUserIdPutApiArg = {
  userId: number;
  userApiIn: UserApiIn;
};
export type DeleteUsersUserIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteUsersUserIdDeleteApiArg = number;
export type CreateUsersPostApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type CreateUsersPostApiArg = UserApiIn;
export type ReadManyUsersGetApiResponse =
  /** status 200 Successful Response */ UserApiOut[];
export type ReadManyUsersGetApiArg = {
  offset?: number;
  limit?: number;
};
export type GetLinkTokenUsersMeInstitutionLinksLinkTokenGetApiResponse =
  /** status 200 Successful Response */ string;
export type GetLinkTokenUsersMeInstitutionLinksLinkTokenGetApiArg =
  | number
  | null;
export type SetPublicTokenUsersMeInstitutionLinksPublicTokenPostApiResponse =
  /** status 200 Successful Response */ any;
export type SetPublicTokenUsersMeInstitutionLinksPublicTokenPostApiArg = {
  publicToken: string;
  institutionPlaidId: string;
};
export type ResyncUsersMeInstitutionLinksResyncPostApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkPlaidOut;
export type ResyncUsersMeInstitutionLinksResyncPostApiArg = number;
export type CreateUsersMeInstitutionLinksPostApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type CreateUsersMeInstitutionLinksPostApiArg = {
  institutionId: number;
  userInstitutionLinkApiIn: UserInstitutionLinkApiIn;
};
export type ReadManyUsersMeInstitutionLinksGetApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut[];
export type ReadManyUsersMeInstitutionLinksGetApiArg = void;
export type ReadUsersMeInstitutionLinksUserinstitutionlinkIdGetApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type ReadUsersMeInstitutionLinksUserinstitutionlinkIdGetApiArg = number;
export type UpdateUsersMeInstitutionLinksUserinstitutionlinkIdPutApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type UpdateUsersMeInstitutionLinksUserinstitutionlinkIdPutApiArg = {
  userinstitutionlinkId: number;
  userInstitutionLinkApiIn: UserInstitutionLinkApiIn;
};
export type DeleteUsersMeInstitutionLinksUserinstitutionlinkIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteUsersMeInstitutionLinksUserinstitutionlinkIdDeleteApiArg =
  number;
export type ReadManyUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidStartDateEndDateGetApiResponse =
  /** status 200 Successful Response */ TransactionPlaidIn[];
export type ReadManyUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidStartDateEndDateGetApiArg =
  {
    userinstitutionlinkId: number;
    startDate: string;
    endDate: string;
  };
export type ResetManyUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResetPutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut[];
export type ResetManyUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResetPutApiArg =
  number;
export type ResetUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidTransactionIdResetPutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut;
export type ResetUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidTransactionIdResetPutApiArg =
  {
    userinstitutionlinkId: number;
    transactionId: number;
  };
export type SyncUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidSyncPostApiResponse =
  /** status 200 Successful Response */ any;
export type SyncUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidSyncPostApiArg =
  number;
export type ResyncUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResyncStartDateEndDatePutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut[];
export type ResyncUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResyncStartDateEndDatePutApiArg =
  {
    userinstitutionlinkId: number;
    startDate: string;
    endDate: string;
    dryRun?: boolean;
  };
export type CreateUsersMeMovementsPostApiResponse =
  /** status 200 Successful Response */ MovementApiOut;
export type CreateUsersMeMovementsPostApiArg = number[];
export type ReadManyUsersMeMovementsGetApiResponse =
  /** status 200 Successful Response */ MovementApiOut[];
export type ReadManyUsersMeMovementsGetApiArg = {
  userinstitutionlinkId?: number | null;
  accountId?: number | null;
  page?: number;
  perPage?: number;
  startDate?: string | null;
  endDate?: string | null;
  search?: string | null;
  transactionAmountGe?: number | string | null;
  transactionAmountLe?: number | string | null;
  isAmountAbs?: boolean;
  transactionsGe?: number | null;
  transactionsLe?: number | null;
  isDescending?: boolean;
  sortBy?: MovementField;
};
export type ReadUsersMeMovementsMovementIdGetApiResponse =
  /** status 200 Successful Response */ MovementApiOut;
export type ReadUsersMeMovementsMovementIdGetApiArg = number;
export type UpdateUsersMeMovementsMovementIdPutApiResponse =
  /** status 200 Successful Response */ MovementApiOut;
export type UpdateUsersMeMovementsMovementIdPutApiArg = {
  movementId: number;
  movementApiIn: MovementApiIn;
};
export type DeleteUsersMeMovementsMovementIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteUsersMeMovementsMovementIdDeleteApiArg = number;
export type AddTransactionsUsersMeMovementsMovementIdTransactionsPutApiResponse =
  /** status 200 Successful Response */ MovementApiOut;
export type AddTransactionsUsersMeMovementsMovementIdTransactionsPutApiArg = {
  movementId: number;
  body: number[];
};
export type ReadExpensesUsersMeMovementsAggregatesStartDateEndDateExpensesGetApiResponse =
  /** status 200 Successful Response */ MovementApiOut[];
export type ReadExpensesUsersMeMovementsAggregatesStartDateEndDateExpensesGetApiArg =
  {
    startDate: string;
    endDate: string;
  };
export type ReadIncomeUsersMeMovementsAggregatesStartDateEndDateIncomeGetApiResponse =
  /** status 200 Successful Response */ MovementApiOut[];
export type ReadIncomeUsersMeMovementsAggregatesStartDateEndDateIncomeGetApiArg =
  {
    startDate: string;
    endDate: string;
  };
export type GetAggregateUsersMeMovementsAggregatesStartDateGetApiResponse =
  /** status 200 Successful Response */ PlStatement;
export type GetAggregateUsersMeMovementsAggregatesStartDateGetApiArg = string;
export type GetManyAggregatesUsersMeMovementsAggregatesGetApiResponse =
  /** status 200 Successful Response */ PlStatement[];
export type GetManyAggregatesUsersMeMovementsAggregatesGetApiArg = {
  page?: number;
  perPage?: number;
};
export type ReadManyUsersMeTransactionsGetApiResponse =
  /** status 200 Successful Response */ TransactionApiOut[];
export type ReadManyUsersMeTransactionsGetApiArg = {
  accountId?: number | null;
  page?: number;
  perPage?: number;
  timestampGe?: string | null;
  timestampLe?: string | null;
  search?: string | null;
  isDescending?: boolean;
  amountGe?: number | string | null;
  amountLe?: number | string | null;
  isAmountAbs?: boolean;
};
export type ReadManyUsersMeAccountsGetApiResponse =
  /** status 200 Successful Response */ AccountApiOut[];
export type ReadManyUsersMeAccountsGetApiArg = void;
export type CreateUsersMeAccountsPostApiResponse =
  /** status 200 Successful Response */ AccountApiOut;
export type CreateUsersMeAccountsPostApiArg = {
  userinstitutionlinkId?: number | null;
  accountApiIn: AccountApiIn;
};
export type PreviewUsersMeAccountsPreviewPostApiResponse =
  /** status 200 Successful Response */ TransactionApiIn[];
export type PreviewUsersMeAccountsPreviewPostApiArg = {
  accountId: number;
  bodyPreviewUsersMeAccountsPreviewPost: BodyPreviewUsersMeAccountsPreviewPost;
};
export type ReadUsersMeAccountsAccountIdGetApiResponse =
  /** status 200 Successful Response */ AccountApiOut;
export type ReadUsersMeAccountsAccountIdGetApiArg = number;
export type UpdateUsersMeAccountsAccountIdPutApiResponse =
  /** status 200 Successful Response */ AccountApiOut;
export type UpdateUsersMeAccountsAccountIdPutApiArg = {
  accountId: number;
  userinstitutionlinkId: number | null;
  accountApiIn: AccountApiIn;
};
export type DeleteUsersMeAccountsAccountIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteUsersMeAccountsAccountIdDeleteApiArg = number;
export type UpdateBalanceUsersMeAccountsAccountIdUpdateBalancePutApiResponse =
  /** status 200 Successful Response */ AccountApiOut;
export type UpdateBalanceUsersMeAccountsAccountIdUpdateBalancePutApiArg =
  number;
export type UpdateTransactionsAmountDefaultCurrencyUsersMeAccountsAccountIdUpdateTransactionsAmountDefaultCurrencyPutApiResponse =
  /** status 200 Successful Response */ any;
export type UpdateTransactionsAmountDefaultCurrencyUsersMeAccountsAccountIdUpdateTransactionsAmountDefaultCurrencyPutApiArg =
  number;
export type CreateManyUsersMeAccountsAccountIdMovementsPostApiResponse =
  /** status 200 Successful Response */ MovementApiOut[];
export type CreateManyUsersMeAccountsAccountIdMovementsPostApiArg = {
  accountId: number;
  bodyCreateManyUsersMeAccountsAccountIdMovementsPost: BodyCreateManyUsersMeAccountsAccountIdMovementsPost;
};
export type CreateUsersMeAccountsAccountIdMovementsMovementIdTransactionsPostApiResponse =
  /** status 200 Successful Response */ TransactionApiOut;
export type CreateUsersMeAccountsAccountIdMovementsMovementIdTransactionsPostApiArg =
  {
    accountId: number;
    movementId: number;
    transactionApiInInput: TransactionApiIn2;
  };
export type ReadUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdGetApiResponse =
  /** status 200 Successful Response */ TransactionApiOut;
export type ReadUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdGetApiArg =
  {
    accountId: number;
    movementId: number;
    transactionId: number;
  };
export type UpdateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPutApiResponse =
  /** status 200 Successful Response */ TransactionApiOut;
export type UpdateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPutApiArg =
  {
    accountId: number;
    movementId: number;
    transactionId: number;
    newMovementId: number;
    transactionApiInInput: TransactionApiIn2;
  };
export type DeleteUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDeleteApiArg =
  {
    accountId: number;
    movementId: number;
    transactionId: number;
  };
export type CreateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPostApiResponse =
  /** status 200 Successful Response */ FileApiOut;
export type CreateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPostApiArg =
  {
    accountId: number;
    movementId: number;
    transactionId: number;
    bodyCreateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPost: BodyCreateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPost;
  };
export type ReadManyUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesGetApiResponse =
  /** status 200 Successful Response */ FileApiOut[];
export type ReadManyUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesGetApiArg =
  {
    accountId: number;
    movementId: number;
    transactionId: number;
  };
export type ReadUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdGetApiResponse =
  /** status 200 Successful Response */ Blob;
export type ReadUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdGetApiArg =
  {
    accountId: number;
    movementId: number;
    transactionId: number;
    fileId: number;
  };
export type DeleteUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesFileIdDeleteApiArg =
  {
    accountId: number;
    movementId: number;
    transactionId: number;
    fileId: number;
  };
export type UpdateBalancesAccountsUpdateBalancesPostApiResponse =
  /** status 200 Successful Response */ any;
export type UpdateBalancesAccountsUpdateBalancesPostApiArg = void;
export type ReadPlaidTransactionsPlaidIdGetApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut;
export type ReadPlaidTransactionsPlaidIdGetApiArg = number;
export type UpdatePlaidTransactionsPlaidIdPutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut;
export type UpdatePlaidTransactionsPlaidIdPutApiArg = {
  id: number;
  transactionPlaidInInput: TransactionPlaidIn2;
};
export type ReadManyCategoriesGetApiResponse =
  /** status 200 Successful Response */ CategoryApiOut[];
export type ReadManyCategoriesGetApiArg = void;
export type ReadCategoriesCategoryIdGetApiResponse =
  /** status 200 Successful Response */ CategoryApiOut;
export type ReadCategoriesCategoryIdGetApiArg = number;
export type GetAllCategoriesPlaidGetAllPutApiResponse =
  /** status 200 Successful Response */ any;
export type GetAllCategoriesPlaidGetAllPutApiArg = void;
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
export type BodyLoginAuthLoginPost = {
  grant_type?: string | null;
  username: string;
  password: string;
  scope?: string;
  client_id?: string | null;
  client_secret?: string | null;
};
export type BodyResetAuthResetPasswordPost = {
  token: string;
  new_password: string;
};
export type TransactionDeserialiserApiOut = {
  id: number;
  module_name: string;
  amount_deserialiser: string;
  timestamp_deserialiser: string;
  name_deserialiser: string;
  skip_rows: number;
  ascending_timestamp: boolean;
  columns: number;
  delimiter: string;
  encoding: string;
};
export type TransactionDeserialiserApiIn = {
  module_name: string;
  amount_deserialiser: string;
  timestamp_deserialiser: string;
  name_deserialiser: string;
  skip_rows: number;
  ascending_timestamp: boolean;
  columns: number;
  delimiter: string;
  encoding: string;
};
export type ReplacementPatternApiOut = {
  id: number;
  pattern: string;
  replacement: string;
};
export type ReplacementPatternApiIn = {
  pattern: string;
  replacement: string;
};
export type InstitutionApiOut = {
  id: number;
  plaid_id: string | null;
  plaid_metadata: string | null;
  name: string;
  country_code: string;
  url: string | null;
  colour?: string | null;
  logo_base64?: string | null;
  is_synced: boolean;
  transactiondeserialiser_id: number | null;
  replacementpattern_id: number | null;
};
export type InstitutionApiIn = {
  name: string;
  country_code: string;
  url: string;
  colour?: string | null;
  logo_base64: string;
};
export type UserApiOut = {
  id: number;
  email: string;
  full_name: string;
  is_superuser: boolean;
  default_currency_code: string;
};
export type UserApiIn = {
  email: string;
  full_name: string;
  is_superuser: boolean;
  default_currency_code: string;
  password: string;
};
export type UserInstitutionLinkPlaidOut = {
  id: number;
  plaid_id: string;
  plaid_metadata: string;
  access_token: string;
  cursor?: string | null;
  institution_id: number;
  user_id: number;
};
export type UserInstitutionLinkApiOut = {
  id: number;
  plaid_id: string | null;
  plaid_metadata: string | null;
  institution_id: number;
  user_id: number;
  is_synced: boolean;
};
export type UserInstitutionLinkApiIn = {};
export type TransactionPlaidIn = {
  plaid_id: string;
  plaid_metadata: string;
  amount: string;
  timestamp: string;
  name: string;
  category_id: number | null;
};
export type FileApiOut = {
  id: number;
  name: string;
  uploaded: string;
  transaction_id: number;
};
export type TransactionPlaidOut = {
  id: number;
  plaid_id: string;
  plaid_metadata: string;
  amount: string;
  timestamp: string;
  name: string;
  category_id: number | null;
  account_balance: string;
  amount_default_currency: string;
  account_id: number;
  movement_id: number;
  files: FileApiOut[];
  is_synced: boolean;
};
export type TransactionApiOut = {
  id: number;
  amount: string;
  timestamp: string;
  name: string;
  category_id: number | null;
  account_balance: string;
  amount_default_currency: string;
  account_id: number;
  movement_id: number;
  files: FileApiOut[];
  is_synced: boolean;
};
export type MovementApiOut = {
  id: number;
  name: string;
  earliest_timestamp: string | null;
  latest_timestamp: string | null;
  transactions: TransactionApiOut[];
  amount_default_currency: string;
};
export type MovementField = "timestamp" | "amount";
export type MovementApiIn = {
  name: string;
};
export type PlStatement = {
  start_date: string;
  end_date: string;
  income: string;
  expenses: string;
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
  type: InstitutionalAccountType;
  mask: string;
  userinstitutionlink_id: number;
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
  initial_balance: string;
  name: string;
  institutionalaccount: InstitutionalAccount | null;
  noninstitutionalaccount: NonInstitutionalAccount | null;
  is_synced: boolean;
  balance: string;
};
export type InstitutionalAccount2 = {
  type: InstitutionalAccountType;
  mask: string;
};
export type NonInstitutionalAccount2 = {
  type: NonInstitutionalAccountType;
};
export type AccountApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  institutionalaccount?: InstitutionalAccount2 | null;
  noninstitutionalaccount?: NonInstitutionalAccount2 | null;
};
export type TransactionApiIn = {
  amount: string;
  timestamp: string;
  name: string;
  category_id: number | null;
};
export type BodyPreviewUsersMeAccountsPreviewPost = {
  file: Blob;
};
export type TransactionApiIn2 = {
  amount: number | string;
  timestamp: string;
  name: string;
  category_id: number | null;
};
export type BodyCreateManyUsersMeAccountsAccountIdMovementsPost = {
  transactions: TransactionApiIn2[];
  transaction_ids: number[];
};
export type BodyCreateUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesPost =
  {
    file: Blob;
  };
export type TransactionPlaidIn2 = {
  plaid_id: string;
  plaid_metadata: string;
  amount: number | string;
  timestamp: string;
  name: string;
  category_id: number | null;
};
export type CategoryApiOut = {
  id: number;
  name: string;
  icon_base64: Blob;
};
