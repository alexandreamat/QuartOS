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
      readManyApiReplacementPatternsGet: build.query<
        ReadManyApiReplacementPatternsGetApiResponse,
        ReadManyApiReplacementPatternsGetApiArg
      >({
        query: () => ({ url: `/api/replacement-patterns/` }),
        providesTags: ["replacement-patterns"],
      }),
      createApiReplacementPatternsPost: build.mutation<
        CreateApiReplacementPatternsPostApiResponse,
        CreateApiReplacementPatternsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/replacement-patterns/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["replacement-patterns"],
      }),
      readApiReplacementPatternsIdGet: build.query<
        ReadApiReplacementPatternsIdGetApiResponse,
        ReadApiReplacementPatternsIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/api/replacement-patterns/${queryArg}` }),
        providesTags: ["replacement-patterns"],
      }),
      updateApiReplacementPatternsIdPut: build.mutation<
        UpdateApiReplacementPatternsIdPutApiResponse,
        UpdateApiReplacementPatternsIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/replacement-patterns/${queryArg.id}`,
          method: "PUT",
          body: queryArg.replacementPatternApiIn,
        }),
        invalidatesTags: ["replacement-patterns"],
      }),
      deleteApiReplacementPatternsIdDelete: build.mutation<
        DeleteApiReplacementPatternsIdDeleteApiResponse,
        DeleteApiReplacementPatternsIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/replacement-patterns/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["replacement-patterns"],
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
          body: queryArg.institutionApiIn,
          params: {
            transactiondeserialiser_id: queryArg.transactiondeserialiserId,
            replacementpattern_id: queryArg.replacementpatternId,
          },
        }),
        invalidatesTags: ["institutions"],
      }),
      syncApiInstitutionsInstitutionIdSyncPost: build.mutation<
        SyncApiInstitutionsInstitutionIdSyncPostApiResponse,
        SyncApiInstitutionsInstitutionIdSyncPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/institutions/${queryArg}/sync`,
          method: "POST",
        }),
        invalidatesTags: ["institutions"],
      }),
      readApiInstitutionsInstitutionIdGet: build.query<
        ReadApiInstitutionsInstitutionIdGetApiResponse,
        ReadApiInstitutionsInstitutionIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/api/institutions/${queryArg}` }),
        providesTags: ["institutions"],
      }),
      updateApiInstitutionsInstitutionIdPut: build.mutation<
        UpdateApiInstitutionsInstitutionIdPutApiResponse,
        UpdateApiInstitutionsInstitutionIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/institutions/${queryArg.institutionId}`,
          method: "PUT",
          body: queryArg.institutionApiIn,
          params: {
            transactiondeserialiser_id: queryArg.transactiondeserialiserId,
            replacementpattern_id: queryArg.replacementpatternId,
          },
        }),
        invalidatesTags: ["institutions"],
      }),
      deleteApiInstitutionsInstitutionIdDelete: build.mutation<
        DeleteApiInstitutionsInstitutionIdDeleteApiResponse,
        DeleteApiInstitutionsInstitutionIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/institutions/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["institutions"],
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
      readApiUsersUserIdGet: build.query<
        ReadApiUsersUserIdGetApiResponse,
        ReadApiUsersUserIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/api/users/${queryArg}` }),
        providesTags: ["users"],
      }),
      updateApiUsersUserIdPut: build.mutation<
        UpdateApiUsersUserIdPutApiResponse,
        UpdateApiUsersUserIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/${queryArg.userId}`,
          method: "PUT",
          body: queryArg.userApiIn,
        }),
        invalidatesTags: ["users"],
      }),
      deleteApiUsersUserIdDelete: build.mutation<
        DeleteApiUsersUserIdDeleteApiResponse,
        DeleteApiUsersUserIdDeleteApiArg
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
          params: { offset: queryArg.offset, limit: queryArg.limit },
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
      getLinkTokenApiUsersMeInstitutionLinksLinkTokenGet: build.query<
        GetLinkTokenApiUsersMeInstitutionLinksLinkTokenGetApiResponse,
        GetLinkTokenApiUsersMeInstitutionLinksLinkTokenGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/institution-links/link_token`,
          params: { userinstitutionlink_id: queryArg },
        }),
        providesTags: ["users", "institution-links"],
      }),
      setPublicTokenApiUsersMeInstitutionLinksPublicTokenPost: build.mutation<
        SetPublicTokenApiUsersMeInstitutionLinksPublicTokenPostApiResponse,
        SetPublicTokenApiUsersMeInstitutionLinksPublicTokenPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/institution-links/public_token`,
          method: "POST",
          params: {
            public_token: queryArg.publicToken,
            institution_plaid_id: queryArg.institutionPlaidId,
          },
        }),
        invalidatesTags: ["users", "institution-links"],
      }),
      resyncApiUsersMeInstitutionLinksResyncPost: build.mutation<
        ResyncApiUsersMeInstitutionLinksResyncPostApiResponse,
        ResyncApiUsersMeInstitutionLinksResyncPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/institution-links/resync`,
          method: "POST",
          params: { userinstitutionlink_id: queryArg },
        }),
        invalidatesTags: ["users", "institution-links"],
      }),
      readManyApiUsersMeInstitutionLinksGet: build.query<
        ReadManyApiUsersMeInstitutionLinksGetApiResponse,
        ReadManyApiUsersMeInstitutionLinksGetApiArg
      >({
        query: () => ({ url: `/api/users/me/institution-links/` }),
        providesTags: ["users", "institution-links"],
      }),
      createApiUsersMeInstitutionLinksPost: build.mutation<
        CreateApiUsersMeInstitutionLinksPostApiResponse,
        CreateApiUsersMeInstitutionLinksPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/institution-links/`,
          method: "POST",
          body: queryArg.userInstitutionLinkApiIn,
          params: { institution_id: queryArg.institutionId },
        }),
        invalidatesTags: ["users", "institution-links"],
      }),
      readApiUsersMeInstitutionLinksUserinstitutionlinkIdGet: build.query<
        ReadApiUsersMeInstitutionLinksUserinstitutionlinkIdGetApiResponse,
        ReadApiUsersMeInstitutionLinksUserinstitutionlinkIdGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/institution-links/${queryArg}`,
        }),
        providesTags: ["users", "institution-links"],
      }),
      updateApiUsersMeInstitutionLinksUserinstitutionlinkIdPut: build.mutation<
        UpdateApiUsersMeInstitutionLinksUserinstitutionlinkIdPutApiResponse,
        UpdateApiUsersMeInstitutionLinksUserinstitutionlinkIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/institution-links/${queryArg.userinstitutionlinkId}`,
          method: "PUT",
          body: queryArg.userInstitutionLinkApiIn,
        }),
        invalidatesTags: ["users", "institution-links"],
      }),
      deleteApiUsersMeInstitutionLinksUserinstitutionlinkIdDelete:
        build.mutation<
          DeleteApiUsersMeInstitutionLinksUserinstitutionlinkIdDeleteApiResponse,
          DeleteApiUsersMeInstitutionLinksUserinstitutionlinkIdDeleteApiArg
        >({
          query: (queryArg) => ({
            url: `/api/users/me/institution-links/${queryArg}`,
            method: "DELETE",
          }),
          invalidatesTags: ["users", "institution-links"],
        }),
      readApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidStartDateEndDateGet:
        build.query<
          ReadApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidStartDateEndDateGetApiResponse,
          ReadApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidStartDateEndDateGetApiArg
        >({
          query: (queryArg) => ({
            url: `/api/users/me/institution-links/${queryArg.userinstitutionlinkId}/transactions/plaid/${queryArg.startDate}/${queryArg.endDate}`,
          }),
          providesTags: ["users", "institution-links", "transactions"],
        }),
      resetManyApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResetPut:
        build.mutation<
          ResetManyApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResetPutApiResponse,
          ResetManyApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResetPutApiArg
        >({
          query: (queryArg) => ({
            url: `/api/users/me/institution-links/${queryArg}/transactions/plaid/reset`,
            method: "PUT",
          }),
          invalidatesTags: ["users", "institution-links", "transactions"],
        }),
      resetApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidTransactionIdResetPut:
        build.mutation<
          ResetApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidTransactionIdResetPutApiResponse,
          ResetApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidTransactionIdResetPutApiArg
        >({
          query: (queryArg) => ({
            url: `/api/users/me/institution-links/${queryArg.userinstitutionlinkId}/transactions/plaid/${queryArg.transactionId}/reset`,
            method: "PUT",
          }),
          invalidatesTags: ["users", "institution-links", "transactions"],
        }),
      syncApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidSyncPost:
        build.mutation<
          SyncApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidSyncPostApiResponse,
          SyncApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidSyncPostApiArg
        >({
          query: (queryArg) => ({
            url: `/api/users/me/institution-links/${queryArg}/transactions/plaid/sync`,
            method: "POST",
          }),
          invalidatesTags: ["users", "institution-links", "transactions"],
        }),
      resyncApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResyncStartDateEndDatePut:
        build.mutation<
          ResyncApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResyncStartDateEndDatePutApiResponse,
          ResyncApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResyncStartDateEndDatePutApiArg
        >({
          query: (queryArg) => ({
            url: `/api/users/me/institution-links/${queryArg.userinstitutionlinkId}/transactions/plaid/resync/${queryArg.startDate}/${queryArg.endDate}`,
            method: "PUT",
            params: { dry_run: queryArg.dryRun },
          }),
          invalidatesTags: ["users", "institution-links", "transactions"],
        }),
      readManyApiUsersMeMovementsGet: build.query<
        ReadManyApiUsersMeMovementsGetApiResponse,
        ReadManyApiUsersMeMovementsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/movements/`,
          params: {
            userinstitutionlink_id: queryArg.userinstitutionlinkId,
            account_id: queryArg.accountId,
            page: queryArg.page,
            per_page: queryArg.perPage,
            start_date: queryArg.startDate,
            end_date: queryArg.endDate,
            search: queryArg.search,
            amount_gt: queryArg.amountGt,
            amount_lt: queryArg.amountLt,
            is_descending: queryArg.isDescending,
            sort_by: queryArg.sortBy,
          },
        }),
        providesTags: ["users", "movements"],
      }),
      readApiUsersMeMovementsMovementIdGet: build.query<
        ReadApiUsersMeMovementsMovementIdGetApiResponse,
        ReadApiUsersMeMovementsMovementIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/api/users/me/movements/${queryArg}` }),
        providesTags: ["users", "movements"],
      }),
      updateApiUsersMeMovementsMovementIdPut: build.mutation<
        UpdateApiUsersMeMovementsMovementIdPutApiResponse,
        UpdateApiUsersMeMovementsMovementIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/movements/${queryArg.movementId}`,
          method: "PUT",
          body: queryArg.movementApiIn,
        }),
        invalidatesTags: ["users", "movements"],
      }),
      deleteApiUsersMeMovementsMovementIdDelete: build.mutation<
        DeleteApiUsersMeMovementsMovementIdDeleteApiResponse,
        DeleteApiUsersMeMovementsMovementIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/movements/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["users", "movements"],
      }),
      readExpensesApiUsersMeMovementsAggregatesStartDateEndDateExpensesGet:
        build.query<
          ReadExpensesApiUsersMeMovementsAggregatesStartDateEndDateExpensesGetApiResponse,
          ReadExpensesApiUsersMeMovementsAggregatesStartDateEndDateExpensesGetApiArg
        >({
          query: (queryArg) => ({
            url: `/api/users/me/movements/aggregates/${queryArg.startDate}/${queryArg.endDate}/expenses`,
          }),
          providesTags: ["users", "movements"],
        }),
      readIncomeApiUsersMeMovementsAggregatesStartDateEndDateIncomeGet:
        build.query<
          ReadIncomeApiUsersMeMovementsAggregatesStartDateEndDateIncomeGetApiResponse,
          ReadIncomeApiUsersMeMovementsAggregatesStartDateEndDateIncomeGetApiArg
        >({
          query: (queryArg) => ({
            url: `/api/users/me/movements/aggregates/${queryArg.startDate}/${queryArg.endDate}/income`,
          }),
          providesTags: ["users", "movements"],
        }),
      getAggregateApiUsersMeMovementsAggregatesStartDateEndDateGet: build.query<
        GetAggregateApiUsersMeMovementsAggregatesStartDateEndDateGetApiResponse,
        GetAggregateApiUsersMeMovementsAggregatesStartDateEndDateGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/movements/aggregates/${queryArg.startDate}/${queryArg.endDate}`,
        }),
        providesTags: ["users", "movements"],
      }),
      getManyAggregatesApiUsersMeMovementsAggregatesGet: build.query<
        GetManyAggregatesApiUsersMeMovementsAggregatesGetApiResponse,
        GetManyAggregatesApiUsersMeMovementsAggregatesGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/movements/aggregates/`,
          params: { page: queryArg.page, per_page: queryArg.perPage },
        }),
        providesTags: ["users", "movements"],
      }),
      readManyApiUsersMeTransactionsGet: build.query<
        ReadManyApiUsersMeTransactionsGetApiResponse,
        ReadManyApiUsersMeTransactionsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/transactions/`,
          params: {
            page: queryArg.page,
            per_page: queryArg.perPage,
            timestamp: queryArg.timestamp,
            search: queryArg.search,
            is_descending: queryArg.isDescending,
            amount_ge: queryArg.amountGe,
            amount_le: queryArg.amountLe,
          },
        }),
        providesTags: ["users", "transactions"],
      }),
      readManyApiUsersMeAccountsGet: build.query<
        ReadManyApiUsersMeAccountsGetApiResponse,
        ReadManyApiUsersMeAccountsGetApiArg
      >({
        query: () => ({ url: `/api/users/me/accounts/` }),
        providesTags: ["users", "accounts"],
      }),
      createApiUsersMeAccountsPost: build.mutation<
        CreateApiUsersMeAccountsPostApiResponse,
        CreateApiUsersMeAccountsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/accounts/`,
          method: "POST",
          body: queryArg.accountApiIn,
          params: { userinstitutionlink_id: queryArg.userinstitutionlinkId },
        }),
        invalidatesTags: ["users", "accounts"],
      }),
      previewApiUsersMeAccountsPreviewPost: build.mutation<
        PreviewApiUsersMeAccountsPreviewPostApiResponse,
        PreviewApiUsersMeAccountsPreviewPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/accounts/preview`,
          method: "POST",
          body: queryArg.bodyPreviewApiUsersMeAccountsPreviewPost,
          params: { account_id: queryArg.accountId },
        }),
        invalidatesTags: ["users", "accounts"],
      }),
      readApiUsersMeAccountsAccountIdGet: build.query<
        ReadApiUsersMeAccountsAccountIdGetApiResponse,
        ReadApiUsersMeAccountsAccountIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/api/users/me/accounts/${queryArg}` }),
        providesTags: ["users", "accounts"],
      }),
      updateApiUsersMeAccountsAccountIdPut: build.mutation<
        UpdateApiUsersMeAccountsAccountIdPutApiResponse,
        UpdateApiUsersMeAccountsAccountIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/accounts/${queryArg.accountId}`,
          method: "PUT",
          body: queryArg.accountApiIn,
          params: { userinstitutionlink_id: queryArg.userinstitutionlinkId },
        }),
        invalidatesTags: ["users", "accounts"],
      }),
      deleteApiUsersMeAccountsAccountIdDelete: build.mutation<
        DeleteApiUsersMeAccountsAccountIdDeleteApiResponse,
        DeleteApiUsersMeAccountsAccountIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/accounts/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["users", "accounts"],
      }),
      updateBalancesApiUsersMeAccountsAccountIdUpdateBalancePut: build.mutation<
        UpdateBalancesApiUsersMeAccountsAccountIdUpdateBalancePutApiResponse,
        UpdateBalancesApiUsersMeAccountsAccountIdUpdateBalancePutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/accounts/${queryArg}/update-balance`,
          method: "PUT",
        }),
        invalidatesTags: ["users", "accounts"],
      }),
      readManyApiUsersMeAccountsAccountIdTransactionsGet: build.query<
        ReadManyApiUsersMeAccountsAccountIdTransactionsGetApiResponse,
        ReadManyApiUsersMeAccountsAccountIdTransactionsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/accounts/${queryArg.accountId}/transactions/`,
          params: {
            page: queryArg.page,
            per_page: queryArg.perPage,
            timestamp: queryArg.timestamp,
            search: queryArg.search,
            is_descending: queryArg.isDescending,
            amount_ge: queryArg.amountGe,
            amount_le: queryArg.amountLe,
          },
        }),
        providesTags: ["users", "accounts", "transactions"],
      }),
      createManyApiUsersMeAccountsAccountIdMovementsPost: build.mutation<
        CreateManyApiUsersMeAccountsAccountIdMovementsPostApiResponse,
        CreateManyApiUsersMeAccountsAccountIdMovementsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/me/accounts/${queryArg.accountId}/movements/`,
          method: "POST",
          body: queryArg.bodyCreateManyApiUsersMeAccountsAccountIdMovementsPost,
        }),
        invalidatesTags: ["users", "accounts", "movements"],
      }),
      createApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsPost:
        build.mutation<
          CreateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsPostApiResponse,
          CreateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsPostApiArg
        >({
          query: (queryArg) => ({
            url: `/api/users/me/accounts/${queryArg.accountId}/movements/${queryArg.movementId}/transactions/`,
            method: "POST",
            body: queryArg.transactionApiIn,
          }),
          invalidatesTags: [
            "users",
            "accounts",
            "movements",
            "transactions",
            "transactions",
          ],
        }),
      readApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdGet:
        build.query<
          ReadApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdGetApiResponse,
          ReadApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdGetApiArg
        >({
          query: (queryArg) => ({
            url: `/api/users/me/accounts/${queryArg.accountId}/movements/${queryArg.movementId}/transactions/${queryArg.transactionId}`,
          }),
          providesTags: ["users", "accounts", "movements", "transactions"],
        }),
      updateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPut:
        build.mutation<
          UpdateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPutApiResponse,
          UpdateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPutApiArg
        >({
          query: (queryArg) => ({
            url: `/api/users/me/accounts/${queryArg.accountId}/movements/${queryArg.movementId}/transactions/${queryArg.transactionId}`,
            method: "PUT",
            body: queryArg.transactionApiIn,
            params: { new_movement_id: queryArg.newMovementId },
          }),
          invalidatesTags: ["users", "accounts", "movements", "transactions"],
        }),
      deleteApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDelete:
        build.mutation<
          DeleteApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDeleteApiResponse,
          DeleteApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDeleteApiArg
        >({
          query: (queryArg) => ({
            url: `/api/users/me/accounts/${queryArg.accountId}/movements/${queryArg.movementId}/transactions/${queryArg.transactionId}`,
            method: "DELETE",
          }),
          invalidatesTags: ["users", "accounts", "movements", "transactions"],
        }),
      updateBalancesApiAccountsUpdateBalancesPost: build.mutation<
        UpdateBalancesApiAccountsUpdateBalancesPostApiResponse,
        UpdateBalancesApiAccountsUpdateBalancesPostApiArg
      >({
        query: () => ({ url: `/api/accounts/update-balances`, method: "POST" }),
        invalidatesTags: ["accounts"],
      }),
      readPlaidApiTransactionsPlaidIdGet: build.query<
        ReadPlaidApiTransactionsPlaidIdGetApiResponse,
        ReadPlaidApiTransactionsPlaidIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/api/transactions/plaid/${queryArg}` }),
        providesTags: ["transactions"],
      }),
      updatePlaidApiTransactionsPlaidIdPut: build.mutation<
        UpdatePlaidApiTransactionsPlaidIdPutApiResponse,
        UpdatePlaidApiTransactionsPlaidIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/api/transactions/plaid/${queryArg.id}`,
          method: "PUT",
          body: queryArg.transactionPlaidIn,
        }),
        invalidatesTags: ["transactions"],
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
export type ReadExchangeRateApiExchangerateGetApiResponse =
  /** status 200 Successful Response */ number;
export type ReadExchangeRateApiExchangerateGetApiArg = {
  fromCurrency: string;
  toCurrency: string;
  date: string;
};
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
export type ReadManyApiReplacementPatternsGetApiResponse =
  /** status 200 Successful Response */ ReplacementPatternApiOut[];
export type ReadManyApiReplacementPatternsGetApiArg = void;
export type CreateApiReplacementPatternsPostApiResponse =
  /** status 200 Successful Response */ ReplacementPatternApiOut;
export type CreateApiReplacementPatternsPostApiArg = ReplacementPatternApiIn;
export type ReadApiReplacementPatternsIdGetApiResponse =
  /** status 200 Successful Response */ ReplacementPatternApiOut;
export type ReadApiReplacementPatternsIdGetApiArg = number;
export type UpdateApiReplacementPatternsIdPutApiResponse =
  /** status 200 Successful Response */ ReplacementPatternApiOut;
export type UpdateApiReplacementPatternsIdPutApiArg = {
  id: number;
  replacementPatternApiIn: ReplacementPatternApiIn;
};
export type DeleteApiReplacementPatternsIdDeleteApiResponse =
  /** status 200 Successful Response */ any;
export type DeleteApiReplacementPatternsIdDeleteApiArg = number;
export type ReadManyApiInstitutionsGetApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut[];
export type ReadManyApiInstitutionsGetApiArg = void;
export type CreateApiInstitutionsPostApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type CreateApiInstitutionsPostApiArg = {
  transactiondeserialiserId?: number;
  replacementpatternId?: number;
  institutionApiIn: InstitutionApiIn;
};
export type SyncApiInstitutionsInstitutionIdSyncPostApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type SyncApiInstitutionsInstitutionIdSyncPostApiArg = number;
export type ReadApiInstitutionsInstitutionIdGetApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type ReadApiInstitutionsInstitutionIdGetApiArg = number;
export type UpdateApiInstitutionsInstitutionIdPutApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type UpdateApiInstitutionsInstitutionIdPutApiArg = {
  institutionId: number;
  transactiondeserialiserId?: number;
  replacementpatternId?: number;
  institutionApiIn: InstitutionApiIn;
};
export type DeleteApiInstitutionsInstitutionIdDeleteApiResponse =
  /** status 200 Successful Response */ any;
export type DeleteApiInstitutionsInstitutionIdDeleteApiArg = number;
export type SignupApiUsersSignupPostApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type SignupApiUsersSignupPostApiArg = UserApiIn;
export type ReadMeApiUsersMeGetApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type ReadMeApiUsersMeGetApiArg = void;
export type UpdateMeApiUsersMePutApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type UpdateMeApiUsersMePutApiArg = UserApiIn;
export type ReadApiUsersUserIdGetApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type ReadApiUsersUserIdGetApiArg = number;
export type UpdateApiUsersUserIdPutApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type UpdateApiUsersUserIdPutApiArg = {
  userId: number;
  userApiIn: UserApiIn;
};
export type DeleteApiUsersUserIdDeleteApiResponse =
  /** status 200 Successful Response */ any;
export type DeleteApiUsersUserIdDeleteApiArg = number;
export type ReadManyApiUsersGetApiResponse =
  /** status 200 Successful Response */ UserApiOut[];
export type ReadManyApiUsersGetApiArg = {
  offset?: number;
  limit?: number;
};
export type CreateApiUsersPostApiResponse =
  /** status 200 Successful Response */ UserApiOut;
export type CreateApiUsersPostApiArg = UserApiIn;
export type GetLinkTokenApiUsersMeInstitutionLinksLinkTokenGetApiResponse =
  /** status 200 Successful Response */ string;
export type GetLinkTokenApiUsersMeInstitutionLinksLinkTokenGetApiArg = number;
export type SetPublicTokenApiUsersMeInstitutionLinksPublicTokenPostApiResponse =
  /** status 200 Successful Response */ any;
export type SetPublicTokenApiUsersMeInstitutionLinksPublicTokenPostApiArg = {
  publicToken: string;
  institutionPlaidId: string;
};
export type ResyncApiUsersMeInstitutionLinksResyncPostApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkPlaidOut;
export type ResyncApiUsersMeInstitutionLinksResyncPostApiArg = number;
export type ReadManyApiUsersMeInstitutionLinksGetApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut[];
export type ReadManyApiUsersMeInstitutionLinksGetApiArg = void;
export type CreateApiUsersMeInstitutionLinksPostApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type CreateApiUsersMeInstitutionLinksPostApiArg = {
  institutionId: number;
  userInstitutionLinkApiIn: UserInstitutionLinkApiIn;
};
export type ReadApiUsersMeInstitutionLinksUserinstitutionlinkIdGetApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type ReadApiUsersMeInstitutionLinksUserinstitutionlinkIdGetApiArg =
  number;
export type UpdateApiUsersMeInstitutionLinksUserinstitutionlinkIdPutApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type UpdateApiUsersMeInstitutionLinksUserinstitutionlinkIdPutApiArg = {
  userinstitutionlinkId: number;
  userInstitutionLinkApiIn: UserInstitutionLinkApiIn;
};
export type DeleteApiUsersMeInstitutionLinksUserinstitutionlinkIdDeleteApiResponse =
  /** status 200 Successful Response */ any;
export type DeleteApiUsersMeInstitutionLinksUserinstitutionlinkIdDeleteApiArg =
  number;
export type ReadApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidStartDateEndDateGetApiResponse =
  /** status 200 Successful Response */ TransactionPlaidIn[];
export type ReadApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidStartDateEndDateGetApiArg =
  {
    userinstitutionlinkId: number;
    startDate: string;
    endDate: string;
  };
export type ResetManyApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResetPutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut[];
export type ResetManyApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResetPutApiArg =
  number;
export type ResetApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidTransactionIdResetPutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut;
export type ResetApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidTransactionIdResetPutApiArg =
  {
    userinstitutionlinkId: number;
    transactionId: number;
  };
export type SyncApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidSyncPostApiResponse =
  /** status 200 Successful Response */ any;
export type SyncApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidSyncPostApiArg =
  number;
export type ResyncApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResyncStartDateEndDatePutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut[];
export type ResyncApiUsersMeInstitutionLinksUserinstitutionlinkIdTransactionsPlaidResyncStartDateEndDatePutApiArg =
  {
    userinstitutionlinkId: number;
    startDate: string;
    endDate: string;
    dryRun?: boolean;
  };
export type ReadManyApiUsersMeMovementsGetApiResponse =
  /** status 200 Successful Response */ MovementApiOut[];
export type ReadManyApiUsersMeMovementsGetApiArg = {
  userinstitutionlinkId?: number;
  accountId?: number;
  page?: number;
  perPage?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  amountGt?: number;
  amountLt?: number;
  isDescending?: boolean;
  sortBy?: MovementField;
};
export type ReadApiUsersMeMovementsMovementIdGetApiResponse =
  /** status 200 Successful Response */ MovementApiOut;
export type ReadApiUsersMeMovementsMovementIdGetApiArg = number;
export type UpdateApiUsersMeMovementsMovementIdPutApiResponse =
  /** status 200 Successful Response */ MovementApiOut;
export type UpdateApiUsersMeMovementsMovementIdPutApiArg = {
  movementId: number;
  movementApiIn: MovementApiIn;
};
export type DeleteApiUsersMeMovementsMovementIdDeleteApiResponse =
  /** status 200 Successful Response */ any;
export type DeleteApiUsersMeMovementsMovementIdDeleteApiArg = number;
export type ReadExpensesApiUsersMeMovementsAggregatesStartDateEndDateExpensesGetApiResponse =
  /** status 200 Successful Response */ MovementApiOut[];
export type ReadExpensesApiUsersMeMovementsAggregatesStartDateEndDateExpensesGetApiArg =
  {
    startDate: string;
    endDate: string;
  };
export type ReadIncomeApiUsersMeMovementsAggregatesStartDateEndDateIncomeGetApiResponse =
  /** status 200 Successful Response */ MovementApiOut[];
export type ReadIncomeApiUsersMeMovementsAggregatesStartDateEndDateIncomeGetApiArg =
  {
    startDate: string;
    endDate: string;
  };
export type GetAggregateApiUsersMeMovementsAggregatesStartDateEndDateGetApiResponse =
  /** status 200 Successful Response */ PlStatement;
export type GetAggregateApiUsersMeMovementsAggregatesStartDateEndDateGetApiArg =
  {
    startDate: string;
    endDate: string;
  };
export type GetManyAggregatesApiUsersMeMovementsAggregatesGetApiResponse =
  /** status 200 Successful Response */ PlStatement[];
export type GetManyAggregatesApiUsersMeMovementsAggregatesGetApiArg = {
  page?: number;
  perPage?: number;
};
export type ReadManyApiUsersMeTransactionsGetApiResponse =
  /** status 200 Successful Response */ TransactionApiOut[];
export type ReadManyApiUsersMeTransactionsGetApiArg = {
  page?: number;
  perPage?: number;
  timestamp?: string;
  search?: string;
  isDescending?: boolean;
  amountGe?: number;
  amountLe?: number;
};
export type ReadManyApiUsersMeAccountsGetApiResponse =
  /** status 200 Successful Response */ AccountApiOut[];
export type ReadManyApiUsersMeAccountsGetApiArg = void;
export type CreateApiUsersMeAccountsPostApiResponse =
  /** status 200 Successful Response */ AccountApiOut;
export type CreateApiUsersMeAccountsPostApiArg = {
  userinstitutionlinkId?: number;
  accountApiIn: AccountApiIn;
};
export type PreviewApiUsersMeAccountsPreviewPostApiResponse =
  /** status 200 Successful Response */ TransactionApiIn[];
export type PreviewApiUsersMeAccountsPreviewPostApiArg = {
  accountId: number;
  bodyPreviewApiUsersMeAccountsPreviewPost: BodyPreviewApiUsersMeAccountsPreviewPost;
};
export type ReadApiUsersMeAccountsAccountIdGetApiResponse =
  /** status 200 Successful Response */ AccountApiOut;
export type ReadApiUsersMeAccountsAccountIdGetApiArg = number;
export type UpdateApiUsersMeAccountsAccountIdPutApiResponse =
  /** status 200 Successful Response */ AccountApiOut;
export type UpdateApiUsersMeAccountsAccountIdPutApiArg = {
  accountId: number;
  userinstitutionlinkId: number;
  accountApiIn: AccountApiIn;
};
export type DeleteApiUsersMeAccountsAccountIdDeleteApiResponse =
  /** status 200 Successful Response */ any;
export type DeleteApiUsersMeAccountsAccountIdDeleteApiArg = number;
export type UpdateBalancesApiUsersMeAccountsAccountIdUpdateBalancePutApiResponse =
  /** status 200 Successful Response */ AccountApiOut;
export type UpdateBalancesApiUsersMeAccountsAccountIdUpdateBalancePutApiArg =
  number;
export type ReadManyApiUsersMeAccountsAccountIdTransactionsGetApiResponse =
  /** status 200 Successful Response */ TransactionApiOut[];
export type ReadManyApiUsersMeAccountsAccountIdTransactionsGetApiArg = {
  accountId: number;
  page?: number;
  perPage?: number;
  timestamp?: string;
  search?: string;
  isDescending?: boolean;
  amountGe?: number;
  amountLe?: number;
};
export type CreateManyApiUsersMeAccountsAccountIdMovementsPostApiResponse =
  /** status 200 Successful Response */ MovementApiOut[];
export type CreateManyApiUsersMeAccountsAccountIdMovementsPostApiArg = {
  accountId: number;
  bodyCreateManyApiUsersMeAccountsAccountIdMovementsPost: BodyCreateManyApiUsersMeAccountsAccountIdMovementsPost;
};
export type CreateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsPostApiResponse =
  /** status 200 Successful Response */ TransactionApiOut;
export type CreateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsPostApiArg =
  {
    accountId: number;
    movementId: number;
    transactionApiIn: TransactionApiIn;
  };
export type ReadApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdGetApiResponse =
  /** status 200 Successful Response */ TransactionApiOut;
export type ReadApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdGetApiArg =
  {
    accountId: number;
    movementId: number;
    transactionId: number;
  };
export type UpdateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPutApiResponse =
  /** status 200 Successful Response */ TransactionApiOut;
export type UpdateApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdPutApiArg =
  {
    accountId: number;
    movementId: number;
    transactionId: number;
    newMovementId: number;
    transactionApiIn: TransactionApiIn;
  };
export type DeleteApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDeleteApiResponse =
  /** status 200 Successful Response */ any;
export type DeleteApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdDeleteApiArg =
  {
    accountId: number;
    movementId: number;
    transactionId: number;
  };
export type UpdateBalancesApiAccountsUpdateBalancesPostApiResponse =
  /** status 200 Successful Response */ any;
export type UpdateBalancesApiAccountsUpdateBalancesPostApiArg = void;
export type ReadPlaidApiTransactionsPlaidIdGetApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut;
export type ReadPlaidApiTransactionsPlaidIdGetApiArg = number;
export type UpdatePlaidApiTransactionsPlaidIdPutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut;
export type UpdatePlaidApiTransactionsPlaidIdPutApiArg = {
  id: number;
  transactionPlaidIn: TransactionPlaidIn;
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
  skip_rows: number;
  columns: number;
  delimiter: string;
  encoding: string;
};
export type TransactionDeserialiserApiIn = {
  module_name: string;
  amount_deserialiser: string;
  timestamp_deserialiser: string;
  name_deserialiser: string;
  currency_code_deserialiser: string;
  skip_rows: number;
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
  plaid_id?: string;
  plaid_metadata?: string;
  name: string;
  country_code: string;
  url?: string;
  colour?: string;
  logo_base64?: string;
  is_synced: boolean;
  transactiondeserialiser_id?: number;
  replacementpattern_id?: number;
};
export type InstitutionApiIn = {
  name: string;
  country_code: string;
  url: string;
  colour?: string;
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
  cursor?: string;
  institution_id: number;
  user_id: number;
};
export type UserInstitutionLinkApiOut = {
  id: number;
  plaid_id?: string;
  plaid_metadata?: string;
  institution_id: number;
  user_id: number;
  is_synced: boolean;
};
export type UserInstitutionLinkApiIn = {};
export type TransactionPlaidIn = {
  plaid_id: string;
  plaid_metadata: string;
  amount: number;
  timestamp: string;
  name: string;
};
export type TransactionPlaidOut = {
  id: number;
  plaid_id: string;
  plaid_metadata: string;
  amount: number;
  timestamp: string;
  name: string;
  account_balance: number;
  account_id: number;
  movement_id: number;
};
export type TransactionApiOut = {
  id: number;
  amount: number;
  timestamp: string;
  name: string;
  account_balance: number;
  account_id: number;
  movement_id: number;
};
export type MovementApiOut = {
  id: number;
  name: string;
  earliest_timestamp?: string;
  latest_timestamp?: string;
  transactions: TransactionApiOut[];
  amounts: {
    [key: string]: number;
  };
  amount: number;
};
export type MovementField = "timestamp" | "amount";
export type MovementApiIn = {
  name: string;
};
export type PlStatement = {
  start_date: string;
  end_date: string;
  income: number;
  expenses: number;
  currency_code: string;
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
  bic?: string;
  iban?: string;
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
  initial_balance: number;
  name: string;
  institutionalaccount?: InstitutionalAccount;
  noninstitutionalaccount?: NonInstitutionalAccount;
  is_synced: boolean;
  balance: number;
};
export type InstitutionalAccount2 = {
  type: InstitutionalAccountType;
  mask: string;
  bic?: string;
  iban?: string;
};
export type NonInstitutionalAccount2 = {
  type: NonInstitutionalAccountType;
};
export type AccountApiIn = {
  currency_code: string;
  initial_balance: number;
  name: string;
  institutionalaccount?: InstitutionalAccount2;
  noninstitutionalaccount?: NonInstitutionalAccount2;
};
export type TransactionApiIn = {
  amount: number;
  timestamp: string;
  name: string;
};
export type BodyPreviewApiUsersMeAccountsPreviewPost = {
  file: Blob;
};
export type BodyCreateManyApiUsersMeAccountsAccountIdMovementsPost = {
  transactions: TransactionApiIn[];
  transaction_ids: number[];
};
