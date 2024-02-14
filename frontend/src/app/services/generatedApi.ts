import { emptySplitApi as api } from "./emptyApi";
export const addTagTypes = [
  "admin",
  "auth",
  "categories",
  "exchangerate",
  "institutions",
  "replacementpatterns",
  "transactiondeserialisers",
  "users",
  "accounts",
  "transactions",
  "files",
  "analytics",
  "institutionlinks",
  "plaidtransactions",
  "merchants",
  "movements",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      accountsUpdateBalancesAdminAccountsUpdateBalancesPut: build.mutation<
        AccountsUpdateBalancesAdminAccountsUpdateBalancesPutApiResponse,
        AccountsUpdateBalancesAdminAccountsUpdateBalancesPutApiArg
      >({
        query: () => ({
          url: `/admin/accounts/update-balances`,
          method: "PUT",
        }),
        invalidatesTags: ["admin"],
      }),
      cateogriesSyncAdminCategoriesSyncPut: build.mutation<
        CateogriesSyncAdminCategoriesSyncPutApiResponse,
        CateogriesSyncAdminCategoriesSyncPutApiArg
      >({
        query: () => ({ url: `/admin/categories/sync`, method: "PUT" }),
        invalidatesTags: ["admin"],
      }),
      orphanSingleTransactionsAdminTransactionsOrphanOnlyChildrenPut:
        build.mutation<
          OrphanSingleTransactionsAdminTransactionsOrphanOnlyChildrenPutApiResponse,
          OrphanSingleTransactionsAdminTransactionsOrphanOnlyChildrenPutApiArg
        >({
          query: () => ({
            url: `/admin/transactions/orphan-only-children`,
            method: "PUT",
          }),
          invalidatesTags: ["admin"],
        }),
      readTransactionAdminTransactionsTransactionsIdGet: build.query<
        ReadTransactionAdminTransactionsTransactionsIdGetApiResponse,
        ReadTransactionAdminTransactionsTransactionsIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/admin/transactions/${queryArg}` }),
        providesTags: ["admin"],
      }),
      updateTransactionAdminTransactionsTransactionsIdPut: build.mutation<
        UpdateTransactionAdminTransactionsTransactionsIdPutApiResponse,
        UpdateTransactionAdminTransactionsTransactionsIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/admin/transactions/${queryArg.transactionsId}`,
          method: "PUT",
          body: queryArg.transactionPlaidInInput,
        }),
        invalidatesTags: ["admin"],
      }),
      updateTransactionsAmountDefaultCurrencyAdminTransactionsUpdateAmountsDefaultCurrencyPut:
        build.mutation<
          UpdateTransactionsAmountDefaultCurrencyAdminTransactionsUpdateAmountsDefaultCurrencyPutApiResponse,
          UpdateTransactionsAmountDefaultCurrencyAdminTransactionsUpdateAmountsDefaultCurrencyPutApiArg
        >({
          query: () => ({
            url: `/admin/transactions/update-amounts-default-currency`,
            method: "PUT",
          }),
          invalidatesTags: ["admin"],
        }),
      resyncUserInstitutionLinkAdminUserinstitutionlinksUserinstitutionlinkIdResyncPut:
        build.mutation<
          ResyncUserInstitutionLinkAdminUserinstitutionlinksUserinstitutionlinkIdResyncPutApiResponse,
          ResyncUserInstitutionLinkAdminUserinstitutionlinksUserinstitutionlinkIdResyncPutApiArg
        >({
          query: (queryArg) => ({
            url: `/admin/userinstitutionlinks/${queryArg}/resync`,
            method: "PUT",
          }),
          invalidatesTags: ["admin"],
        }),
      resyncTransactionsAdminUserinstitutionlinksUserinstitutionlinkIdResyncStartDateEndDatePut:
        build.mutation<
          ResyncTransactionsAdminUserinstitutionlinksUserinstitutionlinkIdResyncStartDateEndDatePutApiResponse,
          ResyncTransactionsAdminUserinstitutionlinksUserinstitutionlinkIdResyncStartDateEndDatePutApiArg
        >({
          query: (queryArg) => ({
            url: `/admin/userinstitutionlinks/${queryArg.userinstitutionlinkId}/resync/${queryArg.startDate}/${queryArg.endDate}`,
            method: "PUT",
            params: { dry_run: queryArg.dryRun },
          }),
          invalidatesTags: ["admin"],
        }),
      readManyAdminUserinstitutionlinksUserinstitutionlinkIdTransactionsStartDateEndDateGet:
        build.query<
          ReadManyAdminUserinstitutionlinksUserinstitutionlinkIdTransactionsStartDateEndDateGetApiResponse,
          ReadManyAdminUserinstitutionlinksUserinstitutionlinkIdTransactionsStartDateEndDateGetApiArg
        >({
          query: (queryArg) => ({
            url: `/admin/userinstitutionlinks/${queryArg.userinstitutionlinkId}/transactions/${queryArg.startDate}/${queryArg.endDate}`,
          }),
          providesTags: ["admin"],
        }),
      resetManyTransactionsToMetadataAdminUserinstitutionlinksUserinstitutionlinkIdResetToMetadataPut:
        build.mutation<
          ResetManyTransactionsToMetadataAdminUserinstitutionlinksUserinstitutionlinkIdResetToMetadataPutApiResponse,
          ResetManyTransactionsToMetadataAdminUserinstitutionlinksUserinstitutionlinkIdResetToMetadataPutApiArg
        >({
          query: (queryArg) => ({
            url: `/admin/userinstitutionlinks/${queryArg}/reset-to-metadata`,
            method: "PUT",
          }),
          invalidatesTags: ["admin"],
        }),
      resetTransactionToMetadataAdminUserinstitutionlinksUserinstitutionlinkIdTransactionsTransactionIdResetToMetadataPut:
        build.mutation<
          ResetTransactionToMetadataAdminUserinstitutionlinksUserinstitutionlinkIdTransactionsTransactionIdResetToMetadataPutApiResponse,
          ResetTransactionToMetadataAdminUserinstitutionlinksUserinstitutionlinkIdTransactionsTransactionIdResetToMetadataPutApiArg
        >({
          query: (queryArg) => ({
            url: `/admin/userinstitutionlinks/${queryArg.userinstitutionlinkId}/transactions/${queryArg.transactionId}/reset-to-metadata`,
            method: "PUT",
          }),
          invalidatesTags: ["admin"],
        }),
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
      readCategoriesCategoryIdGet: build.query<
        ReadCategoriesCategoryIdGetApiResponse,
        ReadCategoriesCategoryIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/categories/${queryArg}` }),
        providesTags: ["categories"],
      }),
      readManyCategoriesGet: build.query<
        ReadManyCategoriesGetApiResponse,
        ReadManyCategoriesGetApiArg
      >({
        query: () => ({ url: `/categories/` }),
        providesTags: ["categories"],
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
      readManyReplacementpatternsGet: build.query<
        ReadManyReplacementpatternsGetApiResponse,
        ReadManyReplacementpatternsGetApiArg
      >({
        query: () => ({ url: `/replacementpatterns/` }),
        providesTags: ["replacementpatterns"],
      }),
      createReplacementpatternsPost: build.mutation<
        CreateReplacementpatternsPostApiResponse,
        CreateReplacementpatternsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/replacementpatterns/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["replacementpatterns"],
      }),
      readReplacementpatternsIdGet: build.query<
        ReadReplacementpatternsIdGetApiResponse,
        ReadReplacementpatternsIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/replacementpatterns/${queryArg}` }),
        providesTags: ["replacementpatterns"],
      }),
      updateReplacementpatternsIdPut: build.mutation<
        UpdateReplacementpatternsIdPutApiResponse,
        UpdateReplacementpatternsIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/replacementpatterns/${queryArg.id}`,
          method: "PUT",
          body: queryArg.replacementPatternApiIn,
        }),
        invalidatesTags: ["replacementpatterns"],
      }),
      deleteReplacementpatternsIdDelete: build.mutation<
        DeleteReplacementpatternsIdDeleteApiResponse,
        DeleteReplacementpatternsIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/replacementpatterns/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["replacementpatterns"],
      }),
      readManyTransactiondeserialisersGet: build.query<
        ReadManyTransactiondeserialisersGetApiResponse,
        ReadManyTransactiondeserialisersGetApiArg
      >({
        query: () => ({ url: `/transactiondeserialisers/` }),
        providesTags: ["transactiondeserialisers"],
      }),
      createTransactiondeserialisersPost: build.mutation<
        CreateTransactiondeserialisersPostApiResponse,
        CreateTransactiondeserialisersPostApiArg
      >({
        query: (queryArg) => ({
          url: `/transactiondeserialisers/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["transactiondeserialisers"],
      }),
      readTransactiondeserialisersIdGet: build.query<
        ReadTransactiondeserialisersIdGetApiResponse,
        ReadTransactiondeserialisersIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/transactiondeserialisers/${queryArg}` }),
        providesTags: ["transactiondeserialisers"],
      }),
      updateTransactiondeserialisersIdPut: build.mutation<
        UpdateTransactiondeserialisersIdPutApiResponse,
        UpdateTransactiondeserialisersIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/transactiondeserialisers/${queryArg.id}`,
          method: "PUT",
          body: queryArg.transactionDeserialiserApiIn,
        }),
        invalidatesTags: ["transactiondeserialisers"],
      }),
      deleteTransactiondeserialisersIdDelete: build.mutation<
        DeleteTransactiondeserialisersIdDeleteApiResponse,
        DeleteTransactiondeserialisersIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/transactiondeserialisers/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["transactiondeserialisers"],
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
          body: queryArg.body,
          params: { userinstitutionlink_id: queryArg.userinstitutionlinkId },
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
          body: queryArg.body,
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
      previewUsersMeAccountsAccountIdTransactionsPreviewPost: build.mutation<
        PreviewUsersMeAccountsAccountIdTransactionsPreviewPostApiResponse,
        PreviewUsersMeAccountsAccountIdTransactionsPreviewPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/accounts/${queryArg.accountId}/transactions/preview`,
          method: "POST",
          body: queryArg.bodyPreviewUsersMeAccountsAccountIdTransactionsPreviewPost,
        }),
        invalidatesTags: ["users", "accounts", "transactions"],
      }),
      createManyUsersMeAccountsAccountIdTransactionsBatchPost: build.mutation<
        CreateManyUsersMeAccountsAccountIdTransactionsBatchPostApiResponse,
        CreateManyUsersMeAccountsAccountIdTransactionsBatchPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/accounts/${queryArg.accountId}/transactions/batch/`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["users", "accounts", "transactions"],
      }),
      createUsersMeAccountsAccountIdTransactionsPost: build.mutation<
        CreateUsersMeAccountsAccountIdTransactionsPostApiResponse,
        CreateUsersMeAccountsAccountIdTransactionsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/accounts/${queryArg.accountId}/transactions/`,
          method: "POST",
          body: queryArg.transactionApiInInput,
          params: { movement_id: queryArg.movementId },
        }),
        invalidatesTags: ["users", "accounts", "transactions"],
      }),
      updateUsersMeAccountsAccountIdTransactionsTransactionIdPut:
        build.mutation<
          UpdateUsersMeAccountsAccountIdTransactionsTransactionIdPutApiResponse,
          UpdateUsersMeAccountsAccountIdTransactionsTransactionIdPutApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg.accountId}/transactions/${queryArg.transactionId}`,
            method: "PUT",
            body: queryArg.transactionApiInInput,
          }),
          invalidatesTags: ["users", "accounts", "transactions"],
        }),
      deleteUsersMeAccountsAccountIdTransactionsTransactionIdDelete:
        build.mutation<
          DeleteUsersMeAccountsAccountIdTransactionsTransactionIdDeleteApiResponse,
          DeleteUsersMeAccountsAccountIdTransactionsTransactionIdDeleteApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg.accountId}/transactions/${queryArg.transactionId}`,
            method: "DELETE",
          }),
          invalidatesTags: ["users", "accounts", "transactions"],
        }),
      createUsersMeAccountsAccountIdTransactionsTransactionIdFilesPost:
        build.mutation<
          CreateUsersMeAccountsAccountIdTransactionsTransactionIdFilesPostApiResponse,
          CreateUsersMeAccountsAccountIdTransactionsTransactionIdFilesPostApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg.accountId}/transactions/${queryArg.transactionId}/files/`,
            method: "POST",
            body: queryArg.bodyCreateUsersMeAccountsAccountIdTransactionsTransactionIdFilesPost,
          }),
          invalidatesTags: ["users", "accounts", "transactions", "files"],
        }),
      readManyUsersMeAccountsAccountIdTransactionsTransactionIdFilesGet:
        build.query<
          ReadManyUsersMeAccountsAccountIdTransactionsTransactionIdFilesGetApiResponse,
          ReadManyUsersMeAccountsAccountIdTransactionsTransactionIdFilesGetApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg.accountId}/transactions/${queryArg.transactionId}/files/`,
          }),
          providesTags: ["users", "accounts", "transactions", "files"],
        }),
      readUsersMeAccountsAccountIdTransactionsTransactionIdFilesFileIdGet:
        build.query<
          ReadUsersMeAccountsAccountIdTransactionsTransactionIdFilesFileIdGetApiResponse,
          ReadUsersMeAccountsAccountIdTransactionsTransactionIdFilesFileIdGetApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg.accountId}/transactions/${queryArg.transactionId}/files/${queryArg.fileId}`,
          }),
          providesTags: ["users", "accounts", "transactions", "files"],
        }),
      deleteUsersMeAccountsAccountIdTransactionsTransactionIdFilesFileIdDelete:
        build.mutation<
          DeleteUsersMeAccountsAccountIdTransactionsTransactionIdFilesFileIdDeleteApiResponse,
          DeleteUsersMeAccountsAccountIdTransactionsTransactionIdFilesFileIdDeleteApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/accounts/${queryArg.accountId}/transactions/${queryArg.transactionId}/files/${queryArg.fileId}`,
            method: "DELETE",
          }),
          invalidatesTags: ["users", "accounts", "transactions", "files"],
        }),
      getDetailedPlStatementUsersMeAnalyticsDetailedMonthGet: build.query<
        GetDetailedPlStatementUsersMeAnalyticsDetailedMonthGetApiResponse,
        GetDetailedPlStatementUsersMeAnalyticsDetailedMonthGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/analytics/detailed/${queryArg}`,
        }),
        providesTags: ["users", "analytics"],
      }),
      getManyPlStatementsUsersMeAnalyticsGet: build.query<
        GetManyPlStatementsUsersMeAnalyticsGetApiResponse,
        GetManyPlStatementsUsersMeAnalyticsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/analytics/`,
          params: { page: queryArg.page, per_page: queryArg.perPage },
        }),
        providesTags: ["users", "analytics"],
      }),
      getLinkTokenUsersMeInstitutionlinksLinkTokenGet: build.query<
        GetLinkTokenUsersMeInstitutionlinksLinkTokenGetApiResponse,
        GetLinkTokenUsersMeInstitutionlinksLinkTokenGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institutionlinks/link_token`,
          params: { userinstitutionlink_id: queryArg },
        }),
        providesTags: ["users", "institutionlinks"],
      }),
      setPublicTokenUsersMeInstitutionlinksPublicTokenPost: build.mutation<
        SetPublicTokenUsersMeInstitutionlinksPublicTokenPostApiResponse,
        SetPublicTokenUsersMeInstitutionlinksPublicTokenPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institutionlinks/public_token`,
          method: "POST",
          params: {
            public_token: queryArg.publicToken,
            institution_plaid_id: queryArg.institutionPlaidId,
          },
        }),
        invalidatesTags: ["users", "institutionlinks"],
      }),
      createUsersMeInstitutionlinksPost: build.mutation<
        CreateUsersMeInstitutionlinksPostApiResponse,
        CreateUsersMeInstitutionlinksPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institutionlinks/`,
          method: "POST",
          body: queryArg.userInstitutionLinkApiIn,
          params: { institution_id: queryArg.institutionId },
        }),
        invalidatesTags: ["users", "institutionlinks"],
      }),
      readManyUsersMeInstitutionlinksGet: build.query<
        ReadManyUsersMeInstitutionlinksGetApiResponse,
        ReadManyUsersMeInstitutionlinksGetApiArg
      >({
        query: () => ({ url: `/users/me/institutionlinks/` }),
        providesTags: ["users", "institutionlinks"],
      }),
      readUsersMeInstitutionlinksUserinstitutionlinkIdGet: build.query<
        ReadUsersMeInstitutionlinksUserinstitutionlinkIdGetApiResponse,
        ReadUsersMeInstitutionlinksUserinstitutionlinkIdGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institutionlinks/${queryArg}`,
        }),
        providesTags: ["users", "institutionlinks"],
      }),
      updateUsersMeInstitutionlinksUserinstitutionlinkIdPut: build.mutation<
        UpdateUsersMeInstitutionlinksUserinstitutionlinkIdPutApiResponse,
        UpdateUsersMeInstitutionlinksUserinstitutionlinkIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institutionlinks/${queryArg.userinstitutionlinkId}`,
          method: "PUT",
          body: queryArg.userInstitutionLinkApiIn,
        }),
        invalidatesTags: ["users", "institutionlinks"],
      }),
      deleteUsersMeInstitutionlinksUserinstitutionlinkIdDelete: build.mutation<
        DeleteUsersMeInstitutionlinksUserinstitutionlinkIdDeleteApiResponse,
        DeleteUsersMeInstitutionlinksUserinstitutionlinkIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institutionlinks/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["users", "institutionlinks"],
      }),
      syncUsersMeInstitutionlinksUserinstitutionlinkIdPlaidtransactionsSyncPost:
        build.mutation<
          SyncUsersMeInstitutionlinksUserinstitutionlinkIdPlaidtransactionsSyncPostApiResponse,
          SyncUsersMeInstitutionlinksUserinstitutionlinkIdPlaidtransactionsSyncPostApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/institutionlinks/${queryArg}/plaidtransactions/sync`,
            method: "POST",
          }),
          invalidatesTags: ["users", "institutionlinks", "plaidtransactions"],
        }),
      readManyUsersMeMerchantsGet: build.query<
        ReadManyUsersMeMerchantsGetApiResponse,
        ReadManyUsersMeMerchantsGetApiArg
      >({
        query: () => ({ url: `/users/me/merchants/` }),
        providesTags: ["users", "merchants"],
      }),
      createUsersMeMerchantsPost: build.mutation<
        CreateUsersMeMerchantsPostApiResponse,
        CreateUsersMeMerchantsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/merchants/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["users", "merchants"],
      }),
      updateUsersMeMerchantsMerchantIdPut: build.mutation<
        UpdateUsersMeMerchantsMerchantIdPutApiResponse,
        UpdateUsersMeMerchantsMerchantIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/merchants/${queryArg.merchantId}`,
          method: "PUT",
          body: queryArg.merchantApiIn,
        }),
        invalidatesTags: ["users", "merchants"],
      }),
      deleteUsersMeMerchantsMerchantIdDelete: build.mutation<
        DeleteUsersMeMerchantsMerchantIdDeleteApiResponse,
        DeleteUsersMeMerchantsMerchantIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/merchants/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["users", "merchants"],
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
            page: queryArg.page,
            per_page: queryArg.perPage,
            start_date: queryArg.startDate,
            end_date: queryArg.endDate,
            search: queryArg.search,
            is_amount_abs: queryArg.isAmountAbs,
            transactions_ge: queryArg.transactionsGe,
            transactions_le: queryArg.transactionsLe,
            is_descending: queryArg.isDescending,
            sort_by: queryArg.sortBy,
            category_id: queryArg.categoryId,
            amount_gt: queryArg.amountGt,
            amount_lt: queryArg.amountLt,
            amount_ge: queryArg.amountGe,
            amount_le: queryArg.amountLe,
          },
        }),
        providesTags: ["users", "movements"],
      }),
      updateAllUsersMeMovementsPut: build.mutation<
        UpdateAllUsersMeMovementsPutApiResponse,
        UpdateAllUsersMeMovementsPutApiArg
      >({
        query: () => ({ url: `/users/me/movements/`, method: "PUT" }),
        invalidatesTags: ["users", "movements"],
      }),
      mergeUsersMeMovementsMergePost: build.mutation<
        MergeUsersMeMovementsMergePostApiResponse,
        MergeUsersMeMovementsMergePostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/movements/merge`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["users", "movements"],
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
      readManyUsersMeMovementsMovementIdTransactionsGet: build.query<
        ReadManyUsersMeMovementsMovementIdTransactionsGetApiResponse,
        ReadManyUsersMeMovementsMovementIdTransactionsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/movements/${queryArg}/transactions/`,
        }),
        providesTags: ["users", "movements", "transactions"],
      }),
      addUsersMeMovementsMovementIdTransactionsPut: build.mutation<
        AddUsersMeMovementsMovementIdTransactionsPutApiResponse,
        AddUsersMeMovementsMovementIdTransactionsPutApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/movements/${queryArg.movementId}/transactions/`,
          method: "PUT",
          body: queryArg.body,
        }),
        invalidatesTags: ["users", "movements", "transactions"],
      }),
      removeUsersMeMovementsMovementIdTransactionsTransactionIdDelete:
        build.mutation<
          RemoveUsersMeMovementsMovementIdTransactionsTransactionIdDeleteApiResponse,
          RemoveUsersMeMovementsMovementIdTransactionsTransactionIdDeleteApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/movements/${queryArg.movementId}/transactions/${queryArg.transactionId}`,
            method: "DELETE",
          }),
          invalidatesTags: ["users", "movements", "transactions"],
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
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedApi };
export type AccountsUpdateBalancesAdminAccountsUpdateBalancesPutApiResponse =
  /** status 200 Successful Response */ any;
export type AccountsUpdateBalancesAdminAccountsUpdateBalancesPutApiArg = void;
export type CateogriesSyncAdminCategoriesSyncPutApiResponse =
  /** status 200 Successful Response */ any;
export type CateogriesSyncAdminCategoriesSyncPutApiArg = void;
export type OrphanSingleTransactionsAdminTransactionsOrphanOnlyChildrenPutApiResponse =
  /** status 200 Successful Response */ any;
export type OrphanSingleTransactionsAdminTransactionsOrphanOnlyChildrenPutApiArg =
  void;
export type ReadTransactionAdminTransactionsTransactionsIdGetApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut;
export type ReadTransactionAdminTransactionsTransactionsIdGetApiArg = number;
export type UpdateTransactionAdminTransactionsTransactionsIdPutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut;
export type UpdateTransactionAdminTransactionsTransactionsIdPutApiArg = {
  transactionsId: number;
  transactionPlaidInInput: TransactionPlaidIn;
};
export type UpdateTransactionsAmountDefaultCurrencyAdminTransactionsUpdateAmountsDefaultCurrencyPutApiResponse =
  /** status 200 Successful Response */ any;
export type UpdateTransactionsAmountDefaultCurrencyAdminTransactionsUpdateAmountsDefaultCurrencyPutApiArg =
  void;
export type ResyncUserInstitutionLinkAdminUserinstitutionlinksUserinstitutionlinkIdResyncPutApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkPlaidOut;
export type ResyncUserInstitutionLinkAdminUserinstitutionlinksUserinstitutionlinkIdResyncPutApiArg =
  number;
export type ResyncTransactionsAdminUserinstitutionlinksUserinstitutionlinkIdResyncStartDateEndDatePutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut[];
export type ResyncTransactionsAdminUserinstitutionlinksUserinstitutionlinkIdResyncStartDateEndDatePutApiArg =
  {
    userinstitutionlinkId: number;
    startDate: string;
    endDate: string;
    dryRun?: boolean;
  };
export type ReadManyAdminUserinstitutionlinksUserinstitutionlinkIdTransactionsStartDateEndDateGetApiResponse =
  /** status 200 Successful Response */ TransactionPlaidIn2[];
export type ReadManyAdminUserinstitutionlinksUserinstitutionlinkIdTransactionsStartDateEndDateGetApiArg =
  {
    userinstitutionlinkId: number;
    startDate: string;
    endDate: string;
  };
export type ResetManyTransactionsToMetadataAdminUserinstitutionlinksUserinstitutionlinkIdResetToMetadataPutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut[];
export type ResetManyTransactionsToMetadataAdminUserinstitutionlinksUserinstitutionlinkIdResetToMetadataPutApiArg =
  number;
export type ResetTransactionToMetadataAdminUserinstitutionlinksUserinstitutionlinkIdTransactionsTransactionIdResetToMetadataPutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut;
export type ResetTransactionToMetadataAdminUserinstitutionlinksUserinstitutionlinkIdTransactionsTransactionIdResetToMetadataPutApiArg =
  {
    userinstitutionlinkId: number;
    transactionId: number;
  };
export type LoginAuthLoginPostApiResponse =
  /** status 200 Successful Response */ Token;
export type LoginAuthLoginPostApiArg = BodyLoginAuthLoginPost;
export type ResetAuthResetPasswordPostApiResponse =
  /** status 200 Successful Response */ any;
export type ResetAuthResetPasswordPostApiArg = BodyResetAuthResetPasswordPost;
export type ReadCategoriesCategoryIdGetApiResponse =
  /** status 200 Successful Response */ CategoryApiOut;
export type ReadCategoriesCategoryIdGetApiArg = number;
export type ReadManyCategoriesGetApiResponse =
  /** status 200 Successful Response */ CategoryApiOut[];
export type ReadManyCategoriesGetApiArg = void;
export type ReadExchangeRateExchangerateGetApiResponse =
  /** status 200 Successful Response */ string;
export type ReadExchangeRateExchangerateGetApiArg = {
  fromCurrency: string;
  toCurrency: string;
  date: string;
};
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
export type ReadManyReplacementpatternsGetApiResponse =
  /** status 200 Successful Response */ ReplacementPatternApiOut[];
export type ReadManyReplacementpatternsGetApiArg = void;
export type CreateReplacementpatternsPostApiResponse =
  /** status 200 Successful Response */ ReplacementPatternApiOut;
export type CreateReplacementpatternsPostApiArg = ReplacementPatternApiIn;
export type ReadReplacementpatternsIdGetApiResponse =
  /** status 200 Successful Response */ ReplacementPatternApiOut;
export type ReadReplacementpatternsIdGetApiArg = number;
export type UpdateReplacementpatternsIdPutApiResponse =
  /** status 200 Successful Response */ ReplacementPatternApiOut;
export type UpdateReplacementpatternsIdPutApiArg = {
  id: number;
  replacementPatternApiIn: ReplacementPatternApiIn;
};
export type DeleteReplacementpatternsIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteReplacementpatternsIdDeleteApiArg = number;
export type ReadManyTransactiondeserialisersGetApiResponse =
  /** status 200 Successful Response */ TransactionDeserialiserApiOut[];
export type ReadManyTransactiondeserialisersGetApiArg = void;
export type CreateTransactiondeserialisersPostApiResponse =
  /** status 200 Successful Response */ TransactionDeserialiserApiOut;
export type CreateTransactiondeserialisersPostApiArg =
  TransactionDeserialiserApiIn;
export type ReadTransactiondeserialisersIdGetApiResponse =
  /** status 200 Successful Response */ TransactionDeserialiserApiOut;
export type ReadTransactiondeserialisersIdGetApiArg = number;
export type UpdateTransactiondeserialisersIdPutApiResponse =
  /** status 200 Successful Response */ TransactionDeserialiserApiOut;
export type UpdateTransactiondeserialisersIdPutApiArg = {
  id: number;
  transactionDeserialiserApiIn: TransactionDeserialiserApiIn;
};
export type DeleteTransactiondeserialisersIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteTransactiondeserialisersIdDeleteApiArg = number;
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
export type ReadManyUsersMeAccountsGetApiResponse =
  /** status 200 Successful Response */ (
    | DepositoryApiOut
    | LoanApiOut
    | CreditApiOut
    | BrokerageApiOut
    | InvestmentApiOut
    | CashApiOut
    | PersonalLedgerApiOut
    | PropertyApiOut
  )[];
export type ReadManyUsersMeAccountsGetApiArg = void;
export type CreateUsersMeAccountsPostApiResponse =
  /** status 200 Successful Response */
    | DepositoryApiOut
    | LoanApiOut
    | CreditApiOut
    | BrokerageApiOut
    | InvestmentApiOut
    | CashApiOut
    | PersonalLedgerApiOut
    | PropertyApiOut;
export type CreateUsersMeAccountsPostApiArg = {
  userinstitutionlinkId?: number | null;
  body:
    | DepositoryApiIn
    | LoanApiIn
    | CreditApiIn
    | BrokerageApiIn
    | InvestmentApiIn
    | CashApiIn
    | PersonalLedgerApiIn
    | PropertyApiIn;
};
export type ReadUsersMeAccountsAccountIdGetApiResponse =
  /** status 200 Successful Response */
    | DepositoryApiOut
    | LoanApiOut
    | CreditApiOut
    | BrokerageApiOut
    | InvestmentApiOut
    | CashApiOut
    | PersonalLedgerApiOut
    | PropertyApiOut;
export type ReadUsersMeAccountsAccountIdGetApiArg = number;
export type UpdateUsersMeAccountsAccountIdPutApiResponse =
  /** status 200 Successful Response */
    | DepositoryApiOut
    | LoanApiOut
    | CreditApiOut
    | BrokerageApiOut
    | InvestmentApiOut
    | CashApiOut
    | PersonalLedgerApiOut
    | PropertyApiOut;
export type UpdateUsersMeAccountsAccountIdPutApiArg = {
  accountId: number;
  userinstitutionlinkId: number | null;
  body:
    | DepositoryApiIn
    | LoanApiIn
    | CreditApiIn
    | BrokerageApiIn
    | InvestmentApiIn
    | CashApiIn
    | PersonalLedgerApiIn
    | PropertyApiIn;
};
export type DeleteUsersMeAccountsAccountIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteUsersMeAccountsAccountIdDeleteApiArg = number;
export type PreviewUsersMeAccountsAccountIdTransactionsPreviewPostApiResponse =
  /** status 200 Successful Response */ TransactionApiIn[];
export type PreviewUsersMeAccountsAccountIdTransactionsPreviewPostApiArg = {
  accountId: number;
  bodyPreviewUsersMeAccountsAccountIdTransactionsPreviewPost: BodyPreviewUsersMeAccountsAccountIdTransactionsPreviewPost;
};
export type CreateManyUsersMeAccountsAccountIdTransactionsBatchPostApiResponse =
  /** status 200 Successful Response */ TransactionApiOut[];
export type CreateManyUsersMeAccountsAccountIdTransactionsBatchPostApiArg = {
  accountId: number;
  body: TransactionApiIn2[];
};
export type CreateUsersMeAccountsAccountIdTransactionsPostApiResponse =
  /** status 200 Successful Response */ TransactionApiOut;
export type CreateUsersMeAccountsAccountIdTransactionsPostApiArg = {
  accountId: number;
  movementId?: number | null;
  transactionApiInInput: TransactionApiIn2;
};
export type UpdateUsersMeAccountsAccountIdTransactionsTransactionIdPutApiResponse =
  /** status 200 Successful Response */ TransactionApiOut;
export type UpdateUsersMeAccountsAccountIdTransactionsTransactionIdPutApiArg = {
  accountId: number;
  transactionId: number;
  transactionApiInInput: TransactionApiIn2;
};
export type DeleteUsersMeAccountsAccountIdTransactionsTransactionIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteUsersMeAccountsAccountIdTransactionsTransactionIdDeleteApiArg =
  {
    accountId: number;
    transactionId: number;
  };
export type CreateUsersMeAccountsAccountIdTransactionsTransactionIdFilesPostApiResponse =
  /** status 200 Successful Response */ FileApiOut;
export type CreateUsersMeAccountsAccountIdTransactionsTransactionIdFilesPostApiArg =
  {
    accountId: number;
    transactionId: number;
    bodyCreateUsersMeAccountsAccountIdTransactionsTransactionIdFilesPost: BodyCreateUsersMeAccountsAccountIdTransactionsTransactionIdFilesPost;
  };
export type ReadManyUsersMeAccountsAccountIdTransactionsTransactionIdFilesGetApiResponse =
  /** status 200 Successful Response */ FileApiOut[];
export type ReadManyUsersMeAccountsAccountIdTransactionsTransactionIdFilesGetApiArg =
  {
    accountId: number;
    transactionId: number;
  };
export type ReadUsersMeAccountsAccountIdTransactionsTransactionIdFilesFileIdGetApiResponse =
  /** status 200 Successful Response */ Blob;
export type ReadUsersMeAccountsAccountIdTransactionsTransactionIdFilesFileIdGetApiArg =
  {
    accountId: number;
    transactionId: number;
    fileId: number;
  };
export type DeleteUsersMeAccountsAccountIdTransactionsTransactionIdFilesFileIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteUsersMeAccountsAccountIdTransactionsTransactionIdFilesFileIdDeleteApiArg =
  {
    accountId: number;
    transactionId: number;
    fileId: number;
  };
export type GetDetailedPlStatementUsersMeAnalyticsDetailedMonthGetApiResponse =
  /** status 200 Successful Response */ DetailedPlStatementApiOut;
export type GetDetailedPlStatementUsersMeAnalyticsDetailedMonthGetApiArg =
  string;
export type GetManyPlStatementsUsersMeAnalyticsGetApiResponse =
  /** status 200 Successful Response */ PlStatement[];
export type GetManyPlStatementsUsersMeAnalyticsGetApiArg = {
  page?: number;
  perPage?: number;
};
export type GetLinkTokenUsersMeInstitutionlinksLinkTokenGetApiResponse =
  /** status 200 Successful Response */ string;
export type GetLinkTokenUsersMeInstitutionlinksLinkTokenGetApiArg =
  | number
  | null;
export type SetPublicTokenUsersMeInstitutionlinksPublicTokenPostApiResponse =
  /** status 200 Successful Response */ any;
export type SetPublicTokenUsersMeInstitutionlinksPublicTokenPostApiArg = {
  publicToken: string;
  institutionPlaidId: string;
};
export type CreateUsersMeInstitutionlinksPostApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type CreateUsersMeInstitutionlinksPostApiArg = {
  institutionId: number;
  userInstitutionLinkApiIn: UserInstitutionLinkApiIn;
};
export type ReadManyUsersMeInstitutionlinksGetApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut[];
export type ReadManyUsersMeInstitutionlinksGetApiArg = void;
export type ReadUsersMeInstitutionlinksUserinstitutionlinkIdGetApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type ReadUsersMeInstitutionlinksUserinstitutionlinkIdGetApiArg = number;
export type UpdateUsersMeInstitutionlinksUserinstitutionlinkIdPutApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type UpdateUsersMeInstitutionlinksUserinstitutionlinkIdPutApiArg = {
  userinstitutionlinkId: number;
  userInstitutionLinkApiIn: UserInstitutionLinkApiIn;
};
export type DeleteUsersMeInstitutionlinksUserinstitutionlinkIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteUsersMeInstitutionlinksUserinstitutionlinkIdDeleteApiArg =
  number;
export type SyncUsersMeInstitutionlinksUserinstitutionlinkIdPlaidtransactionsSyncPostApiResponse =
  /** status 200 Successful Response */ any;
export type SyncUsersMeInstitutionlinksUserinstitutionlinkIdPlaidtransactionsSyncPostApiArg =
  number;
export type ReadManyUsersMeMerchantsGetApiResponse =
  /** status 200 Successful Response */ MerchantApiOut[];
export type ReadManyUsersMeMerchantsGetApiArg = void;
export type CreateUsersMeMerchantsPostApiResponse =
  /** status 200 Successful Response */ MerchantApiOut;
export type CreateUsersMeMerchantsPostApiArg = MerchantApiIn;
export type UpdateUsersMeMerchantsMerchantIdPutApiResponse =
  /** status 200 Successful Response */ MerchantApiOut;
export type UpdateUsersMeMerchantsMerchantIdPutApiArg = {
  merchantId: number;
  merchantApiIn: MerchantApiIn;
};
export type DeleteUsersMeMerchantsMerchantIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteUsersMeMerchantsMerchantIdDeleteApiArg = number;
export type CreateUsersMeMovementsPostApiResponse =
  /** status 200 Successful Response */ MovementApiOut;
export type CreateUsersMeMovementsPostApiArg = number[];
export type ReadManyUsersMeMovementsGetApiResponse =
  /** status 200 Successful Response */ MovementApiOut[];
export type ReadManyUsersMeMovementsGetApiArg = {
  page?: number;
  perPage?: number;
  startDate?: string | null;
  endDate?: string | null;
  search?: string | null;
  isAmountAbs?: boolean;
  transactionsGe?: number | null;
  transactionsLe?: number | null;
  isDescending?: boolean;
  sortBy?: MovementField;
  categoryId?: number | null;
  amountGt?: number | string | null;
  amountLt?: number | string | null;
  amountGe?: number | string | null;
  amountLe?: number | string | null;
};
export type UpdateAllUsersMeMovementsPutApiResponse =
  /** status 200 Successful Response */ any;
export type UpdateAllUsersMeMovementsPutApiArg = void;
export type MergeUsersMeMovementsMergePostApiResponse =
  /** status 200 Successful Response */ MovementApiOut;
export type MergeUsersMeMovementsMergePostApiArg = number[];
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
export type ReadManyUsersMeMovementsMovementIdTransactionsGetApiResponse =
  /** status 200 Successful Response */ TransactionApiOut[];
export type ReadManyUsersMeMovementsMovementIdTransactionsGetApiArg = number;
export type AddUsersMeMovementsMovementIdTransactionsPutApiResponse =
  /** status 200 Successful Response */ MovementApiOut;
export type AddUsersMeMovementsMovementIdTransactionsPutApiArg = {
  movementId: number;
  body: number[];
};
export type RemoveUsersMeMovementsMovementIdTransactionsTransactionIdDeleteApiResponse =
  /** status 200 Successful Response */ MovementApiOut | null;
export type RemoveUsersMeMovementsMovementIdTransactionsTransactionIdDeleteApiArg =
  {
    movementId: number;
    transactionId: number;
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
export type FileApiOut = {
  id: number;
  name: string;
  uploaded: string;
  transaction_id: number;
};
export type TransactionPlaidOut = {
  id: number;
  plaid_id: string | null;
  plaid_metadata: string | null;
  is_synced: boolean;
  amount: string;
  timestamp: string;
  name: string;
  category_id: number | null;
  account_balance: string;
  amount_default_currency: string;
  account_id: number;
  movement_id: number | null;
  files: FileApiOut[];
};
export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};
export type HttpValidationError = {
  detail?: ValidationError[];
};
export type TransactionPlaidIn = {
  plaid_id: string;
  plaid_metadata: string;
  amount: number | string;
  timestamp: string;
  name: string;
  category_id: number | null;
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
export type TransactionPlaidIn2 = {
  plaid_id: string;
  plaid_metadata: string;
  amount: string;
  timestamp: string;
  name: string;
  category_id: number | null;
};
export type Token = {
  access_token: string;
  token_type: string;
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
export type CategoryApiOut = {
  id: number;
  plaid_id: string | null;
  plaid_metadata: string | null;
  is_synced: boolean;
  name: string;
  icon_base64: Blob;
};
export type InstitutionApiOut = {
  id: number;
  plaid_id: string | null;
  plaid_metadata: string | null;
  is_synced: boolean;
  name: string;
  country_code: string;
  url: string | null;
  colour?: string | null;
  logo_base64?: string | null;
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
export type ReplacementPatternApiOut = {
  id: number;
  pattern: string;
  replacement: string;
};
export type ReplacementPatternApiIn = {
  pattern: string;
  replacement: string;
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
export type DepositoryApiOut = {
  id: number;
  plaid_id: string | null;
  plaid_metadata: string | null;
  is_synced: boolean;
  balance: string;
  userinstitutionlink_id: number;
  is_institutional: true;
  currency_code: string;
  initial_balance: string;
  name: string;
  type: "depository";
  mask: string;
};
export type LoanApiOut = {
  id: number;
  plaid_id: string | null;
  plaid_metadata: string | null;
  is_synced: boolean;
  balance: string;
  userinstitutionlink_id: number;
  is_institutional: true;
  currency_code: string;
  initial_balance: string;
  name: string;
  type: "loan";
  mask: string;
};
export type CreditApiOut = {
  id: number;
  plaid_id: string | null;
  plaid_metadata: string | null;
  is_synced: boolean;
  balance: string;
  userinstitutionlink_id: number;
  is_institutional: true;
  currency_code: string;
  initial_balance: string;
  name: string;
  type: "credit";
  mask: string;
};
export type BrokerageApiOut = {
  id: number;
  plaid_id: string | null;
  plaid_metadata: string | null;
  is_synced: boolean;
  balance: string;
  userinstitutionlink_id: number;
  is_institutional: true;
  currency_code: string;
  initial_balance: string;
  name: string;
  type: "brokerage";
  mask: string;
};
export type InvestmentApiOut = {
  id: number;
  plaid_id: string | null;
  plaid_metadata: string | null;
  is_synced: boolean;
  balance: string;
  userinstitutionlink_id: number;
  is_institutional: true;
  currency_code: string;
  initial_balance: string;
  name: string;
  type: "investment";
  mask: string;
};
export type CashApiOut = {
  id: number;
  balance: string;
  is_synced: boolean;
  user_id: number;
  is_institutional: false;
  currency_code: string;
  initial_balance: string;
  name: string;
  type: "cash";
};
export type PersonalLedgerApiOut = {
  id: number;
  balance: string;
  is_synced: boolean;
  user_id: number;
  is_institutional: false;
  currency_code: string;
  initial_balance: string;
  name: string;
  type: "personal ledger";
};
export type PropertyApiOut = {
  id: number;
  balance: string;
  is_synced: boolean;
  user_id: number;
  is_institutional: false;
  currency_code: string;
  initial_balance: string;
  name: string;
  type: "property";
};
export type DepositoryApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "depository";
  mask: string;
};
export type LoanApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "loan";
  mask: string;
};
export type CreditApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "credit";
  mask: string;
};
export type BrokerageApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "brokerage";
  mask: string;
};
export type InvestmentApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "investment";
  mask: string;
};
export type CashApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "cash";
};
export type PersonalLedgerApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "personal ledger";
};
export type PropertyApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "property";
};
export type TransactionApiIn = {
  amount: string;
  timestamp: string;
  name: string;
  category_id: number | null;
};
export type BodyPreviewUsersMeAccountsAccountIdTransactionsPreviewPost = {
  file: Blob;
};
export type TransactionApiOut = {
  id: number;
  plaid_id: string | null;
  plaid_metadata: string | null;
  is_synced: boolean;
  amount: string;
  timestamp: string;
  name: string;
  category_id: number | null;
  account_balance: string;
  amount_default_currency: string;
  account_id: number;
  movement_id: number | null;
  files: FileApiOut[];
};
export type TransactionApiIn2 = {
  amount: number | string;
  timestamp: string;
  name: string;
  category_id: number | null;
};
export type BodyCreateUsersMeAccountsAccountIdTransactionsTransactionIdFilesPost =
  {
    file: Blob;
  };
export type DetailedPlStatementApiOut = {
  start_date: string;
  end_date: string;
  income: string;
  expenses: string;
  income_by_category: {
    [key: string]: string;
  };
  expenses_by_category: {
    [key: string]: string;
  };
};
export type PlStatement = {
  start_date: string;
  end_date: string;
  income: string;
  expenses: string;
};
export type UserInstitutionLinkApiOut = {
  id: number;
  plaid_id: string | null;
  plaid_metadata: string | null;
  is_synced: boolean;
  institution_id: number;
  user_id: number;
};
export type UserInstitutionLinkApiIn = {};
export type MerchantApiOut = {
  id: number;
  name: string;
  pattern: string;
  default_category_id: number;
  user_id: number;
};
export type MerchantApiIn = {
  name: string;
  pattern: string;
  default_category_id: number;
};
export type MovementApiOut = {
  id: number;
  name: string;
  category_id: number | null;
  timestamp: string | null;
  transactions_count: number;
  amount_default_currency: string;
};
export type MovementField = "timestamp" | "amount";
export type MovementApiIn = {
  name: string;
  category_id: number | null;
};
