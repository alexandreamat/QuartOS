import { emptySplitApi as api } from "./emptyApi";
export const addTagTypes = [
  "admin",
  "auth",
  "categories",
  "exchange_rate",
  "institutions",
  "replacement_patterns",
  "transaction_deserialisers",
  "users",
  "accounts",
  "transactions",
  "files",
  "analytics",
  "buckets",
  "institution_links",
  "plaid_transactions",
  "merchants",
  "transaction_groups",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      webhookWebhookPost: build.mutation<
        WebhookWebhookPostApiResponse,
        WebhookWebhookPostApiArg
      >({
        query: (queryArg) => ({
          url: `/webhook`,
          method: "POST",
          body: queryArg,
        }),
      }),
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
      setDefaultBucketsAdminTransactionsSetDefaultBucketsPut: build.mutation<
        SetDefaultBucketsAdminTransactionsSetDefaultBucketsPutApiResponse,
        SetDefaultBucketsAdminTransactionsSetDefaultBucketsPutApiArg
      >({
        query: () => ({
          url: `/admin/transactions/set-default-buckets`,
          method: "PUT",
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
      readTransactionAdminTransactionsTransactionIdGet: build.query<
        ReadTransactionAdminTransactionsTransactionIdGetApiResponse,
        ReadTransactionAdminTransactionsTransactionIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/admin/transactions/${queryArg}` }),
        providesTags: ["admin"],
      }),
      updateTransactionAdminTransactionsTransactionIdPut: build.mutation<
        UpdateTransactionAdminTransactionsTransactionIdPutApiResponse,
        UpdateTransactionAdminTransactionsTransactionIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/admin/transactions/${queryArg.transactionId}`,
          method: "PUT",
          body: queryArg.transactionPlaidInInput,
        }),
        invalidatesTags: ["admin"],
      }),
      updateWebhookAdminUserInstitutionLinksUpdateWebhookPut: build.mutation<
        UpdateWebhookAdminUserInstitutionLinksUpdateWebhookPutApiResponse,
        UpdateWebhookAdminUserInstitutionLinksUpdateWebhookPutApiArg
      >({
        query: (queryArg) => ({
          url: `/admin/user-institution-links/update-webhook`,
          method: "PUT",
          params: { webhook_url: queryArg },
        }),
        invalidatesTags: ["admin"],
      }),
      resyncUserInstitutionLinkAdminUserInstitutionLinksUserInstitutionLinkIdResyncPut:
        build.mutation<
          ResyncUserInstitutionLinkAdminUserInstitutionLinksUserInstitutionLinkIdResyncPutApiResponse,
          ResyncUserInstitutionLinkAdminUserInstitutionLinksUserInstitutionLinkIdResyncPutApiArg
        >({
          query: (queryArg) => ({
            url: `/admin/user-institution-links/${queryArg}/resync`,
            method: "PUT",
          }),
          invalidatesTags: ["admin"],
        }),
      resyncTransactionsAdminUserInstitutionLinksUserInstitutionLinkIdResyncStartDateEndDatePut:
        build.mutation<
          ResyncTransactionsAdminUserInstitutionLinksUserInstitutionLinkIdResyncStartDateEndDatePutApiResponse,
          ResyncTransactionsAdminUserInstitutionLinksUserInstitutionLinkIdResyncStartDateEndDatePutApiArg
        >({
          query: (queryArg) => ({
            url: `/admin/user-institution-links/${queryArg.userInstitutionLinkId}/resync/${queryArg.startDate}/${queryArg.endDate}`,
            method: "PUT",
            params: { dry_run: queryArg.dryRun },
          }),
          invalidatesTags: ["admin"],
        }),
      readManyAdminUserInstitutionLinksUserInstitutionLinkIdTransactionsStartDateEndDateGet:
        build.query<
          ReadManyAdminUserInstitutionLinksUserInstitutionLinkIdTransactionsStartDateEndDateGetApiResponse,
          ReadManyAdminUserInstitutionLinksUserInstitutionLinkIdTransactionsStartDateEndDateGetApiArg
        >({
          query: (queryArg) => ({
            url: `/admin/user-institution-links/${queryArg.userInstitutionLinkId}/transactions/${queryArg.startDate}/${queryArg.endDate}`,
          }),
          providesTags: ["admin"],
        }),
      resetManyTransactionsToMetadataAdminUserInstitutionLinksUserInstitutionLinkIdResetToMetadataPut:
        build.mutation<
          ResetManyTransactionsToMetadataAdminUserInstitutionLinksUserInstitutionLinkIdResetToMetadataPutApiResponse,
          ResetManyTransactionsToMetadataAdminUserInstitutionLinksUserInstitutionLinkIdResetToMetadataPutApiArg
        >({
          query: (queryArg) => ({
            url: `/admin/user-institution-links/${queryArg}/reset-to-metadata`,
            method: "PUT",
          }),
          invalidatesTags: ["admin"],
        }),
      resetTransactionToMetadataAdminUserInstitutionLinksUserInstitutionLinkIdTransactionsTransactionIdResetToMetadataPut:
        build.mutation<
          ResetTransactionToMetadataAdminUserInstitutionLinksUserInstitutionLinkIdTransactionsTransactionIdResetToMetadataPutApiResponse,
          ResetTransactionToMetadataAdminUserInstitutionLinksUserInstitutionLinkIdTransactionsTransactionIdResetToMetadataPutApiArg
        >({
          query: (queryArg) => ({
            url: `/admin/user-institution-links/${queryArg.userInstitutionLinkId}/transactions/${queryArg.transactionId}/reset-to-metadata`,
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
      readExchangeRateExchangeRateGet: build.query<
        ReadExchangeRateExchangeRateGetApiResponse,
        ReadExchangeRateExchangeRateGetApiArg
      >({
        query: (queryArg) => ({
          url: `/exchange_rate/`,
          params: {
            from_currency: queryArg.fromCurrency,
            to_currency: queryArg.toCurrency,
            date: queryArg.date,
          },
        }),
        providesTags: ["exchange_rate"],
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
            transaction_deserialiser_id: queryArg.transactionDeserialiserId,
            replacement_pattern_id: queryArg.replacementPatternId,
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
            transaction_deserialiser_id: queryArg.transactionDeserialiserId,
            replacement_pattern_id: queryArg.replacementPatternId,
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
      readManyReplacementPatternsGet: build.query<
        ReadManyReplacementPatternsGetApiResponse,
        ReadManyReplacementPatternsGetApiArg
      >({
        query: () => ({ url: `/replacement_patterns/` }),
        providesTags: ["replacement_patterns"],
      }),
      createReplacementPatternsPost: build.mutation<
        CreateReplacementPatternsPostApiResponse,
        CreateReplacementPatternsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/replacement_patterns/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["replacement_patterns"],
      }),
      readReplacementPatternsIdGet: build.query<
        ReadReplacementPatternsIdGetApiResponse,
        ReadReplacementPatternsIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/replacement_patterns/${queryArg}` }),
        providesTags: ["replacement_patterns"],
      }),
      updateReplacementPatternsIdPut: build.mutation<
        UpdateReplacementPatternsIdPutApiResponse,
        UpdateReplacementPatternsIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/replacement_patterns/${queryArg.id}`,
          method: "PUT",
          body: queryArg.replacementPatternApiIn,
        }),
        invalidatesTags: ["replacement_patterns"],
      }),
      deleteReplacementPatternsIdDelete: build.mutation<
        DeleteReplacementPatternsIdDeleteApiResponse,
        DeleteReplacementPatternsIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/replacement_patterns/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["replacement_patterns"],
      }),
      readManyTransactionDeserialisersGet: build.query<
        ReadManyTransactionDeserialisersGetApiResponse,
        ReadManyTransactionDeserialisersGetApiArg
      >({
        query: () => ({ url: `/transaction_deserialisers/` }),
        providesTags: ["transaction_deserialisers"],
      }),
      createTransactionDeserialisersPost: build.mutation<
        CreateTransactionDeserialisersPostApiResponse,
        CreateTransactionDeserialisersPostApiArg
      >({
        query: (queryArg) => ({
          url: `/transaction_deserialisers/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["transaction_deserialisers"],
      }),
      readTransactionDeserialisersIdGet: build.query<
        ReadTransactionDeserialisersIdGetApiResponse,
        ReadTransactionDeserialisersIdGetApiArg
      >({
        query: (queryArg) => ({
          url: `/transaction_deserialisers/${queryArg}`,
        }),
        providesTags: ["transaction_deserialisers"],
      }),
      updateTransactionDeserialisersIdPut: build.mutation<
        UpdateTransactionDeserialisersIdPutApiResponse,
        UpdateTransactionDeserialisersIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/transaction_deserialisers/${queryArg.id}`,
          method: "PUT",
          body: queryArg.transactionDeserialiserApiIn,
        }),
        invalidatesTags: ["transaction_deserialisers"],
      }),
      deleteTransactionDeserialisersIdDelete: build.mutation<
        DeleteTransactionDeserialisersIdDeleteApiResponse,
        DeleteTransactionDeserialisersIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/transaction_deserialisers/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["transaction_deserialisers"],
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
          params: { page: queryArg.page, per_page: queryArg.perPage },
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
          params: { user_institution_link_id: queryArg.userInstitutionLinkId },
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
          params: { user_institution_link_id: queryArg.userInstitutionLinkId },
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
          params: { transaction_group_id: queryArg.transactionGroupId },
        }),
        invalidatesTags: ["users", "accounts", "transactions"],
      }),
      readManyUsersMeAccountsAccountIdTransactionsGet: build.query<
        ReadManyUsersMeAccountsAccountIdTransactionsGetApiResponse,
        ReadManyUsersMeAccountsAccountIdTransactionsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/accounts/${queryArg.accountId}/transactions`,
          params: {
            search: queryArg.search,
            per_page: queryArg.perPage,
            page: queryArg.page,
            order_by: queryArg.orderBy,
            id__eq: queryArg.idEq,
            timestamp__eq: queryArg.timestampEq,
            timestamp__gt: queryArg.timestampGt,
            timestamp__ge: queryArg.timestampGe,
            timestamp__le: queryArg.timestampLe,
            timestamp__lt: queryArg.timestampLt,
            name__eq: queryArg.nameEq,
            category_id__is_null: queryArg.categoryIdIsNull,
            category_id__eq: queryArg.categoryIdEq,
            transaction_group_id__eq: queryArg.transactionGroupIdEq,
            amount_default_currency__eq: queryArg.amountDefaultCurrencyEq,
            amount_default_currency__eq__abs:
              queryArg.amountDefaultCurrencyEqAbs,
            amount_default_currency__gt: queryArg.amountDefaultCurrencyGt,
            amount_default_currency__gt__abs:
              queryArg.amountDefaultCurrencyGtAbs,
            amount_default_currency__ge: queryArg.amountDefaultCurrencyGe,
            amount_default_currency__ge__abs:
              queryArg.amountDefaultCurrencyGeAbs,
            amount_default_currency__le: queryArg.amountDefaultCurrencyLe,
            amount_default_currency__le__abs:
              queryArg.amountDefaultCurrencyLeAbs,
            amount_default_currency__lt: queryArg.amountDefaultCurrencyLt,
            amount_default_currency__lt__abs:
              queryArg.amountDefaultCurrencyLtAbs,
            amount__eq: queryArg.amountEq,
            amount__eq__abs: queryArg.amountEqAbs,
            amount__gt: queryArg.amountGt,
            amount__gt__abs: queryArg.amountGtAbs,
            amount__ge: queryArg.amountGe,
            amount__ge__abs: queryArg.amountGeAbs,
            amount__le: queryArg.amountLe,
            amount__le__abs: queryArg.amountLeAbs,
            amount__lt: queryArg.amountLt,
            amount__lt__abs: queryArg.amountLtAbs,
            account_balance__eq: queryArg.accountBalanceEq,
            account_balance__eq__abs: queryArg.accountBalanceEqAbs,
            account_balance__gt: queryArg.accountBalanceGt,
            account_balance__gt__abs: queryArg.accountBalanceGtAbs,
            account_balance__ge: queryArg.accountBalanceGe,
            account_balance__ge__abs: queryArg.accountBalanceGeAbs,
            account_balance__le: queryArg.accountBalanceLe,
            account_balance__le__abs: queryArg.accountBalanceLeAbs,
            account_balance__lt: queryArg.accountBalanceLt,
            account_balance__lt__abs: queryArg.accountBalanceLtAbs,
            account_id__eq: queryArg.accountIdEq,
            bucket_id__eq: queryArg.bucketIdEq,
          },
        }),
        providesTags: ["users", "accounts", "transactions"],
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
      getDetailedPlStatementUsersMeAnalyticsDetailedTimestampGeTimestampLtGet:
        build.query<
          GetDetailedPlStatementUsersMeAnalyticsDetailedTimestampGeTimestampLtGetApiResponse,
          GetDetailedPlStatementUsersMeAnalyticsDetailedTimestampGeTimestampLtGetApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/analytics/detailed/${queryArg.timestampGe}/${queryArg.timestampLt}`,
            params: { bucket_id: queryArg.bucketId },
          }),
          providesTags: ["users", "analytics"],
        }),
      getManyPlStatementsUsersMeAnalyticsGet: build.query<
        GetManyPlStatementsUsersMeAnalyticsGetApiResponse,
        GetManyPlStatementsUsersMeAnalyticsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/analytics/`,
          params: {
            aggregate_by: queryArg.aggregateBy,
            bucket_id: queryArg.bucketId,
            page: queryArg.page,
            per_page: queryArg.perPage,
          },
        }),
        providesTags: ["users", "analytics"],
      }),
      readManyUsersMeBucketsGet: build.query<
        ReadManyUsersMeBucketsGetApiResponse,
        ReadManyUsersMeBucketsGetApiArg
      >({
        query: () => ({ url: `/users/me/buckets/` }),
        providesTags: ["users", "buckets"],
      }),
      createUsersMeBucketsPost: build.mutation<
        CreateUsersMeBucketsPostApiResponse,
        CreateUsersMeBucketsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/buckets/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["users", "buckets"],
      }),
      readUsersMeBucketsBucketIdGet: build.query<
        ReadUsersMeBucketsBucketIdGetApiResponse,
        ReadUsersMeBucketsBucketIdGetApiArg
      >({
        query: (queryArg) => ({ url: `/users/me/buckets/${queryArg}` }),
        providesTags: ["users", "buckets"],
      }),
      updateUsersMeBucketsBucketIdPut: build.mutation<
        UpdateUsersMeBucketsBucketIdPutApiResponse,
        UpdateUsersMeBucketsBucketIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/buckets/${queryArg.bucketId}`,
          method: "PUT",
          body: queryArg.bucketApiIn,
        }),
        invalidatesTags: ["users", "buckets"],
      }),
      deleteUsersMeBucketsBucketIdDelete: build.mutation<
        DeleteUsersMeBucketsBucketIdDeleteApiResponse,
        DeleteUsersMeBucketsBucketIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/buckets/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["users", "buckets"],
      }),
      getLinkTokenUsersMeInstitutionLinksLinkTokenGet: build.query<
        GetLinkTokenUsersMeInstitutionLinksLinkTokenGetApiResponse,
        GetLinkTokenUsersMeInstitutionLinksLinkTokenGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institution_links/link_token`,
          params: { user_institution_link_id: queryArg },
        }),
        providesTags: ["users", "institution_links"],
      }),
      setPublicTokenUsersMeInstitutionLinksPublicTokenPost: build.mutation<
        SetPublicTokenUsersMeInstitutionLinksPublicTokenPostApiResponse,
        SetPublicTokenUsersMeInstitutionLinksPublicTokenPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institution_links/public_token`,
          method: "POST",
          params: {
            public_token: queryArg.publicToken,
            institution_plaid_id: queryArg.institutionPlaidId,
          },
        }),
        invalidatesTags: ["users", "institution_links"],
      }),
      createUsersMeInstitutionLinksPost: build.mutation<
        CreateUsersMeInstitutionLinksPostApiResponse,
        CreateUsersMeInstitutionLinksPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institution_links/`,
          method: "POST",
          body: queryArg.userInstitutionLinkApiIn,
          params: { institution_id: queryArg.institutionId },
        }),
        invalidatesTags: ["users", "institution_links"],
      }),
      readManyUsersMeInstitutionLinksGet: build.query<
        ReadManyUsersMeInstitutionLinksGetApiResponse,
        ReadManyUsersMeInstitutionLinksGetApiArg
      >({
        query: () => ({ url: `/users/me/institution_links/` }),
        providesTags: ["users", "institution_links"],
      }),
      readUsersMeInstitutionLinksUserInstitutionLinkIdGet: build.query<
        ReadUsersMeInstitutionLinksUserInstitutionLinkIdGetApiResponse,
        ReadUsersMeInstitutionLinksUserInstitutionLinkIdGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institution_links/${queryArg}`,
        }),
        providesTags: ["users", "institution_links"],
      }),
      updateUsersMeInstitutionLinksUserInstitutionLinkIdPut: build.mutation<
        UpdateUsersMeInstitutionLinksUserInstitutionLinkIdPutApiResponse,
        UpdateUsersMeInstitutionLinksUserInstitutionLinkIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institution_links/${queryArg.userInstitutionLinkId}`,
          method: "PUT",
          body: queryArg.userInstitutionLinkApiIn,
        }),
        invalidatesTags: ["users", "institution_links"],
      }),
      deleteUsersMeInstitutionLinksUserInstitutionLinkIdDelete: build.mutation<
        DeleteUsersMeInstitutionLinksUserInstitutionLinkIdDeleteApiResponse,
        DeleteUsersMeInstitutionLinksUserInstitutionLinkIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/institution_links/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["users", "institution_links"],
      }),
      syncUsersMeInstitutionLinksUserInstitutionLinkIdPlaidTransactionsSyncPost:
        build.mutation<
          SyncUsersMeInstitutionLinksUserInstitutionLinkIdPlaidTransactionsSyncPostApiResponse,
          SyncUsersMeInstitutionLinksUserInstitutionLinkIdPlaidTransactionsSyncPostApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/institution_links/${queryArg}/plaid_transactions/sync`,
            method: "POST",
          }),
          invalidatesTags: ["users", "institution_links", "plaid_transactions"],
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
      mergeUsersMeTransactionGroupsMergePost: build.mutation<
        MergeUsersMeTransactionGroupsMergePostApiResponse,
        MergeUsersMeTransactionGroupsMergePostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/transaction_groups/merge`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["users", "transaction_groups"],
      }),
      readManyUsersMeTransactionGroupsGet: build.query<
        ReadManyUsersMeTransactionGroupsGetApiResponse,
        ReadManyUsersMeTransactionGroupsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/transaction_groups/`,
          params: { page: queryArg.page, per_page: queryArg.perPage },
        }),
        providesTags: ["users", "transaction_groups"],
      }),
      updateAllUsersMeTransactionGroupsPut: build.mutation<
        UpdateAllUsersMeTransactionGroupsPutApiResponse,
        UpdateAllUsersMeTransactionGroupsPutApiArg
      >({
        query: () => ({ url: `/users/me/transaction_groups/`, method: "PUT" }),
        invalidatesTags: ["users", "transaction_groups"],
      }),
      readUsersMeTransactionGroupsTransactionGroupIdGet: build.query<
        ReadUsersMeTransactionGroupsTransactionGroupIdGetApiResponse,
        ReadUsersMeTransactionGroupsTransactionGroupIdGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/transaction_groups/${queryArg}`,
        }),
        providesTags: ["users", "transaction_groups"],
      }),
      updateUsersMeTransactionGroupsTransactionGroupIdPut: build.mutation<
        UpdateUsersMeTransactionGroupsTransactionGroupIdPutApiResponse,
        UpdateUsersMeTransactionGroupsTransactionGroupIdPutApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/transaction_groups/${queryArg.transactionGroupId}`,
          method: "PUT",
          body: queryArg.transactionGroupApiIn,
        }),
        invalidatesTags: ["users", "transaction_groups"],
      }),
      deleteUsersMeTransactionGroupsTransactionGroupIdDelete: build.mutation<
        DeleteUsersMeTransactionGroupsTransactionGroupIdDeleteApiResponse,
        DeleteUsersMeTransactionGroupsTransactionGroupIdDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/transaction_groups/${queryArg}`,
          method: "DELETE",
        }),
        invalidatesTags: ["users", "transaction_groups"],
      }),
      readManyUsersMeTransactionGroupsTransactionGroupIdTransactionsGet:
        build.query<
          ReadManyUsersMeTransactionGroupsTransactionGroupIdTransactionsGetApiResponse,
          ReadManyUsersMeTransactionGroupsTransactionGroupIdTransactionsGetApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/transaction_groups/${queryArg}/transactions/`,
          }),
          providesTags: ["users", "transaction_groups", "transactions"],
        }),
      addUsersMeTransactionGroupsTransactionGroupIdTransactionsPut:
        build.mutation<
          AddUsersMeTransactionGroupsTransactionGroupIdTransactionsPutApiResponse,
          AddUsersMeTransactionGroupsTransactionGroupIdTransactionsPutApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/transaction_groups/${queryArg.transactionGroupId}/transactions/`,
            method: "PUT",
            body: queryArg.body,
          }),
          invalidatesTags: ["users", "transaction_groups", "transactions"],
        }),
      removeUsersMeTransactionGroupsTransactionGroupIdTransactionsTransactionIdDelete:
        build.mutation<
          RemoveUsersMeTransactionGroupsTransactionGroupIdTransactionsTransactionIdDeleteApiResponse,
          RemoveUsersMeTransactionGroupsTransactionGroupIdTransactionsTransactionIdDeleteApiArg
        >({
          query: (queryArg) => ({
            url: `/users/me/transaction_groups/${queryArg.transactionGroupId}/transactions/${queryArg.transactionId}`,
            method: "DELETE",
          }),
          invalidatesTags: ["users", "transaction_groups", "transactions"],
        }),
      readManyUsersMeTransactionsGet: build.query<
        ReadManyUsersMeTransactionsGetApiResponse,
        ReadManyUsersMeTransactionsGetApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/transactions/`,
          params: {
            consolidate: queryArg.consolidate,
            search: queryArg.search,
            per_page: queryArg.perPage,
            page: queryArg.page,
            order_by: queryArg.orderBy,
            id__eq: queryArg.idEq,
            timestamp__eq: queryArg.timestampEq,
            timestamp__gt: queryArg.timestampGt,
            timestamp__ge: queryArg.timestampGe,
            timestamp__le: queryArg.timestampLe,
            timestamp__lt: queryArg.timestampLt,
            name__eq: queryArg.nameEq,
            category_id__is_null: queryArg.categoryIdIsNull,
            category_id__eq: queryArg.categoryIdEq,
            transaction_group_id__eq: queryArg.transactionGroupIdEq,
            amount_default_currency__eq: queryArg.amountDefaultCurrencyEq,
            amount_default_currency__eq__abs:
              queryArg.amountDefaultCurrencyEqAbs,
            amount_default_currency__gt: queryArg.amountDefaultCurrencyGt,
            amount_default_currency__gt__abs:
              queryArg.amountDefaultCurrencyGtAbs,
            amount_default_currency__ge: queryArg.amountDefaultCurrencyGe,
            amount_default_currency__ge__abs:
              queryArg.amountDefaultCurrencyGeAbs,
            amount_default_currency__le: queryArg.amountDefaultCurrencyLe,
            amount_default_currency__le__abs:
              queryArg.amountDefaultCurrencyLeAbs,
            amount_default_currency__lt: queryArg.amountDefaultCurrencyLt,
            amount_default_currency__lt__abs:
              queryArg.amountDefaultCurrencyLtAbs,
            amount__eq: queryArg.amountEq,
            amount__eq__abs: queryArg.amountEqAbs,
            amount__gt: queryArg.amountGt,
            amount__gt__abs: queryArg.amountGtAbs,
            amount__ge: queryArg.amountGe,
            amount__ge__abs: queryArg.amountGeAbs,
            amount__le: queryArg.amountLe,
            amount__le__abs: queryArg.amountLeAbs,
            amount__lt: queryArg.amountLt,
            amount__lt__abs: queryArg.amountLtAbs,
            account_balance__eq: queryArg.accountBalanceEq,
            account_balance__eq__abs: queryArg.accountBalanceEqAbs,
            account_balance__gt: queryArg.accountBalanceGt,
            account_balance__gt__abs: queryArg.accountBalanceGtAbs,
            account_balance__ge: queryArg.accountBalanceGe,
            account_balance__ge__abs: queryArg.accountBalanceGeAbs,
            account_balance__le: queryArg.accountBalanceLe,
            account_balance__le__abs: queryArg.accountBalanceLeAbs,
            account_balance__lt: queryArg.accountBalanceLt,
            account_balance__lt__abs: queryArg.accountBalanceLtAbs,
            account_id__eq: queryArg.accountIdEq,
            bucket_id__eq: queryArg.bucketIdEq,
          },
        }),
        providesTags: ["users", "transactions"],
      }),
      consolidateUsersMeTransactionsPost: build.mutation<
        ConsolidateUsersMeTransactionsPostApiResponse,
        ConsolidateUsersMeTransactionsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/users/me/transactions/`,
          method: "POST",
          body: queryArg,
        }),
        invalidatesTags: ["users", "transactions"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedApi };
export type WebhookWebhookPostApiResponse =
  /** status 200 Successful Response */ any;
export type WebhookWebhookPostApiArg =
  | WebhookUpdateAcknowledgedWebhookReq
  | ItemErrorWebhookReq
  | SyncUpdatesAvailableWebhookReq
  | OtherWebhookRew;
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
export type SetDefaultBucketsAdminTransactionsSetDefaultBucketsPutApiResponse =
  /** status 200 Successful Response */ any;
export type SetDefaultBucketsAdminTransactionsSetDefaultBucketsPutApiArg = void;
export type UpdateTransactionsAmountDefaultCurrencyAdminTransactionsUpdateAmountsDefaultCurrencyPutApiResponse =
  /** status 200 Successful Response */ any;
export type UpdateTransactionsAmountDefaultCurrencyAdminTransactionsUpdateAmountsDefaultCurrencyPutApiArg =
  void;
export type ReadTransactionAdminTransactionsTransactionIdGetApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut;
export type ReadTransactionAdminTransactionsTransactionIdGetApiArg = number;
export type UpdateTransactionAdminTransactionsTransactionIdPutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut;
export type UpdateTransactionAdminTransactionsTransactionIdPutApiArg = {
  transactionId: number;
  transactionPlaidInInput: TransactionPlaidIn;
};
export type UpdateWebhookAdminUserInstitutionLinksUpdateWebhookPutApiResponse =
  /** status 200 Successful Response */ any;
export type UpdateWebhookAdminUserInstitutionLinksUpdateWebhookPutApiArg =
  string;
export type ResyncUserInstitutionLinkAdminUserInstitutionLinksUserInstitutionLinkIdResyncPutApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkPlaidOut;
export type ResyncUserInstitutionLinkAdminUserInstitutionLinksUserInstitutionLinkIdResyncPutApiArg =
  number;
export type ResyncTransactionsAdminUserInstitutionLinksUserInstitutionLinkIdResyncStartDateEndDatePutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut[];
export type ResyncTransactionsAdminUserInstitutionLinksUserInstitutionLinkIdResyncStartDateEndDatePutApiArg =
  {
    userInstitutionLinkId: number;
    startDate: string;
    endDate: string;
    dryRun?: boolean;
  };
export type ReadManyAdminUserInstitutionLinksUserInstitutionLinkIdTransactionsStartDateEndDateGetApiResponse =
  /** status 200 Successful Response */ TransactionPlaidIn2[];
export type ReadManyAdminUserInstitutionLinksUserInstitutionLinkIdTransactionsStartDateEndDateGetApiArg =
  {
    userInstitutionLinkId: number;
    startDate: string;
    endDate: string;
  };
export type ResetManyTransactionsToMetadataAdminUserInstitutionLinksUserInstitutionLinkIdResetToMetadataPutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut[];
export type ResetManyTransactionsToMetadataAdminUserInstitutionLinksUserInstitutionLinkIdResetToMetadataPutApiArg =
  number;
export type ResetTransactionToMetadataAdminUserInstitutionLinksUserInstitutionLinkIdTransactionsTransactionIdResetToMetadataPutApiResponse =
  /** status 200 Successful Response */ TransactionPlaidOut;
export type ResetTransactionToMetadataAdminUserInstitutionLinksUserInstitutionLinkIdTransactionsTransactionIdResetToMetadataPutApiArg =
  {
    userInstitutionLinkId: number;
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
export type ReadExchangeRateExchangeRateGetApiResponse =
  /** status 200 Successful Response */ string;
export type ReadExchangeRateExchangeRateGetApiArg = {
  fromCurrency: string;
  toCurrency: string;
  date: string;
};
export type CreateInstitutionsPostApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type CreateInstitutionsPostApiArg = {
  transactionDeserialiserId?: number | null;
  replacementPatternId?: number | null;
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
  transactionDeserialiserId?: number | null;
  replacementPatternId?: number | null;
  institutionApiIn: InstitutionApiIn;
};
export type DeleteInstitutionsInstitutionIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteInstitutionsInstitutionIdDeleteApiArg = number;
export type SyncInstitutionsInstitutionIdSyncPutApiResponse =
  /** status 200 Successful Response */ InstitutionApiOut;
export type SyncInstitutionsInstitutionIdSyncPutApiArg = number;
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
  page?: number;
  perPage?: number;
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
  userInstitutionLinkId?: number | null;
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
  userInstitutionLinkId: number | null;
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
  transactionGroupId?: number | null;
  transactionApiInInput: TransactionApiIn2;
};
export type ReadManyUsersMeAccountsAccountIdTransactionsGetApiResponse =
  /** status 200 Successful Response */ TransactionApiOut[];
export type ReadManyUsersMeAccountsAccountIdTransactionsGetApiArg = {
  accountId: number;
  search?: string | null;
  perPage?: number;
  page?: number;
  orderBy?:
    | "id__asc"
    | "id__desc"
    | "timestamp__asc"
    | "timestamp__desc"
    | "amount_default_currency__asc"
    | "amount_default_currency__desc"
    | "amount__asc"
    | "amount__desc"
    | "account_balance__asc"
    | "account_balance__desc"
    | "account_id__asc"
    | "account_id__desc"
    | null;
  idEq?: number | null;
  timestampEq?: string | null;
  timestampGt?: string | null;
  timestampGe?: string | null;
  timestampLe?: string | null;
  timestampLt?: string | null;
  nameEq?: string | null;
  categoryIdIsNull?: boolean | null;
  categoryIdEq?: number | null;
  transactionGroupIdEq?: number | null;
  amountDefaultCurrencyEq?: number | string | null;
  amountDefaultCurrencyEqAbs?: number | string | null;
  amountDefaultCurrencyGt?: number | string | null;
  amountDefaultCurrencyGtAbs?: number | string | null;
  amountDefaultCurrencyGe?: number | string | null;
  amountDefaultCurrencyGeAbs?: number | string | null;
  amountDefaultCurrencyLe?: number | string | null;
  amountDefaultCurrencyLeAbs?: number | string | null;
  amountDefaultCurrencyLt?: number | string | null;
  amountDefaultCurrencyLtAbs?: number | string | null;
  amountEq?: number | string | null;
  amountEqAbs?: number | string | null;
  amountGt?: number | string | null;
  amountGtAbs?: number | string | null;
  amountGe?: number | string | null;
  amountGeAbs?: number | string | null;
  amountLe?: number | string | null;
  amountLeAbs?: number | string | null;
  amountLt?: number | string | null;
  amountLtAbs?: number | string | null;
  accountBalanceEq?: number | string | null;
  accountBalanceEqAbs?: number | string | null;
  accountBalanceGt?: number | string | null;
  accountBalanceGtAbs?: number | string | null;
  accountBalanceGe?: number | string | null;
  accountBalanceGeAbs?: number | string | null;
  accountBalanceLe?: number | string | null;
  accountBalanceLeAbs?: number | string | null;
  accountBalanceLt?: number | string | null;
  accountBalanceLtAbs?: number | string | null;
  accountIdEq?: number | null;
  bucketIdEq?: number | null;
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
export type GetDetailedPlStatementUsersMeAnalyticsDetailedTimestampGeTimestampLtGetApiResponse =
  /** status 200 Successful Response */ DetailedPlStatementApiOut;
export type GetDetailedPlStatementUsersMeAnalyticsDetailedTimestampGeTimestampLtGetApiArg =
  {
    timestampGe: string;
    timestampLt: string;
    bucketId?: number | null;
  };
export type GetManyPlStatementsUsersMeAnalyticsGetApiResponse =
  /** status 200 Successful Response */ PlStatementApiOut[];
export type GetManyPlStatementsUsersMeAnalyticsGetApiArg = {
  aggregateBy: "yearly" | "quarterly" | "monthly" | "weekly" | "daily";
  bucketId?: number | null;
  page?: number;
  perPage?: number;
};
export type ReadManyUsersMeBucketsGetApiResponse =
  /** status 200 Successful Response */ BucketApiOut[];
export type ReadManyUsersMeBucketsGetApiArg = void;
export type CreateUsersMeBucketsPostApiResponse =
  /** status 200 Successful Response */ BucketApiOut;
export type CreateUsersMeBucketsPostApiArg = BucketApiIn;
export type ReadUsersMeBucketsBucketIdGetApiResponse =
  /** status 200 Successful Response */ BucketApiOut;
export type ReadUsersMeBucketsBucketIdGetApiArg = number;
export type UpdateUsersMeBucketsBucketIdPutApiResponse =
  /** status 200 Successful Response */ BucketApiOut;
export type UpdateUsersMeBucketsBucketIdPutApiArg = {
  bucketId: number;
  bucketApiIn: BucketApiIn;
};
export type DeleteUsersMeBucketsBucketIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteUsersMeBucketsBucketIdDeleteApiArg = number;
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
export type CreateUsersMeInstitutionLinksPostApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type CreateUsersMeInstitutionLinksPostApiArg = {
  institutionId: number;
  userInstitutionLinkApiIn: UserInstitutionLinkApiIn;
};
export type ReadManyUsersMeInstitutionLinksGetApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut[];
export type ReadManyUsersMeInstitutionLinksGetApiArg = void;
export type ReadUsersMeInstitutionLinksUserInstitutionLinkIdGetApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type ReadUsersMeInstitutionLinksUserInstitutionLinkIdGetApiArg = number;
export type UpdateUsersMeInstitutionLinksUserInstitutionLinkIdPutApiResponse =
  /** status 200 Successful Response */ UserInstitutionLinkApiOut;
export type UpdateUsersMeInstitutionLinksUserInstitutionLinkIdPutApiArg = {
  userInstitutionLinkId: number;
  userInstitutionLinkApiIn: UserInstitutionLinkApiIn;
};
export type DeleteUsersMeInstitutionLinksUserInstitutionLinkIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteUsersMeInstitutionLinksUserInstitutionLinkIdDeleteApiArg =
  number;
export type SyncUsersMeInstitutionLinksUserInstitutionLinkIdPlaidTransactionsSyncPostApiResponse =
  /** status 200 Successful Response */ any;
export type SyncUsersMeInstitutionLinksUserInstitutionLinkIdPlaidTransactionsSyncPostApiArg =
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
export type MergeUsersMeTransactionGroupsMergePostApiResponse =
  /** status 200 Successful Response */ TransactionGroupApiOut;
export type MergeUsersMeTransactionGroupsMergePostApiArg = number[];
export type ReadManyUsersMeTransactionGroupsGetApiResponse =
  /** status 200 Successful Response */ TransactionGroupApiOut[];
export type ReadManyUsersMeTransactionGroupsGetApiArg = {
  page?: number;
  perPage?: number;
};
export type UpdateAllUsersMeTransactionGroupsPutApiResponse =
  /** status 200 Successful Response */ any;
export type UpdateAllUsersMeTransactionGroupsPutApiArg = void;
export type ReadUsersMeTransactionGroupsTransactionGroupIdGetApiResponse =
  /** status 200 Successful Response */ TransactionGroupApiOut;
export type ReadUsersMeTransactionGroupsTransactionGroupIdGetApiArg = number;
export type UpdateUsersMeTransactionGroupsTransactionGroupIdPutApiResponse =
  /** status 200 Successful Response */ TransactionGroupApiOut;
export type UpdateUsersMeTransactionGroupsTransactionGroupIdPutApiArg = {
  transactionGroupId: number;
  transactionGroupApiIn: TransactionGroupApiIn;
};
export type DeleteUsersMeTransactionGroupsTransactionGroupIdDeleteApiResponse =
  /** status 200 Successful Response */ number;
export type DeleteUsersMeTransactionGroupsTransactionGroupIdDeleteApiArg =
  number;
export type ReadManyUsersMeTransactionGroupsTransactionGroupIdTransactionsGetApiResponse =
  /** status 200 Successful Response */ TransactionApiOut[];
export type ReadManyUsersMeTransactionGroupsTransactionGroupIdTransactionsGetApiArg =
  number;
export type AddUsersMeTransactionGroupsTransactionGroupIdTransactionsPutApiResponse =
  /** status 200 Successful Response */ TransactionGroupApiOut;
export type AddUsersMeTransactionGroupsTransactionGroupIdTransactionsPutApiArg =
  {
    transactionGroupId: number;
    body: number[];
  };
export type RemoveUsersMeTransactionGroupsTransactionGroupIdTransactionsTransactionIdDeleteApiResponse =
  /** status 200 Successful Response */ TransactionGroupApiOut | null;
export type RemoveUsersMeTransactionGroupsTransactionGroupIdTransactionsTransactionIdDeleteApiArg =
  {
    transactionGroupId: number;
    transactionId: number;
  };
export type ReadManyUsersMeTransactionsGetApiResponse =
  /** status 200 Successful Response */ (
    | TransactionApiOut
    | TransactionGroupApiOut
  )[];
export type ReadManyUsersMeTransactionsGetApiArg = {
  consolidate?: boolean;
  search?: string | null;
  perPage?: number;
  page?: number;
  orderBy?:
    | "id__asc"
    | "id__desc"
    | "timestamp__asc"
    | "timestamp__desc"
    | "amount_default_currency__asc"
    | "amount_default_currency__desc"
    | "amount__asc"
    | "amount__desc"
    | "account_balance__asc"
    | "account_balance__desc"
    | "account_id__asc"
    | "account_id__desc"
    | null;
  idEq?: number | null;
  timestampEq?: string | null;
  timestampGt?: string | null;
  timestampGe?: string | null;
  timestampLe?: string | null;
  timestampLt?: string | null;
  nameEq?: string | null;
  categoryIdIsNull?: boolean | null;
  categoryIdEq?: number | null;
  transactionGroupIdEq?: number | null;
  amountDefaultCurrencyEq?: number | string | null;
  amountDefaultCurrencyEqAbs?: number | string | null;
  amountDefaultCurrencyGt?: number | string | null;
  amountDefaultCurrencyGtAbs?: number | string | null;
  amountDefaultCurrencyGe?: number | string | null;
  amountDefaultCurrencyGeAbs?: number | string | null;
  amountDefaultCurrencyLe?: number | string | null;
  amountDefaultCurrencyLeAbs?: number | string | null;
  amountDefaultCurrencyLt?: number | string | null;
  amountDefaultCurrencyLtAbs?: number | string | null;
  amountEq?: number | string | null;
  amountEqAbs?: number | string | null;
  amountGt?: number | string | null;
  amountGtAbs?: number | string | null;
  amountGe?: number | string | null;
  amountGeAbs?: number | string | null;
  amountLe?: number | string | null;
  amountLeAbs?: number | string | null;
  amountLt?: number | string | null;
  amountLtAbs?: number | string | null;
  accountBalanceEq?: number | string | null;
  accountBalanceEqAbs?: number | string | null;
  accountBalanceGt?: number | string | null;
  accountBalanceGtAbs?: number | string | null;
  accountBalanceGe?: number | string | null;
  accountBalanceGeAbs?: number | string | null;
  accountBalanceLe?: number | string | null;
  accountBalanceLeAbs?: number | string | null;
  accountBalanceLt?: number | string | null;
  accountBalanceLtAbs?: number | string | null;
  accountIdEq?: number | null;
  bucketIdEq?: number | null;
};
export type ConsolidateUsersMeTransactionsPostApiResponse =
  /** status 200 Successful Response */ TransactionGroupApiOut;
export type ConsolidateUsersMeTransactionsPostApiArg = number[];
export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};
export type HttpValidationError = {
  detail?: ValidationError[];
};
export type Error = {
  error_type: string;
  error_code: string;
  error_message: string;
  display_message: string | null;
  request_id: string;
  causes: any;
  status: number | null;
  documentation_url: string;
  suggested_action: string | null;
};
export type WebhookUpdateAcknowledgedWebhookReq = {
  webhook_type: any;
  webhook_code: any;
  item_id: string;
  environment: any;
  new_webhook_url: string;
  error: Error;
};
export type ItemErrorWebhookReq = {
  webhook_type: any;
  webhook_code: any;
  item_id: string;
  environment: any;
  error: Error;
};
export type SyncUpdatesAvailableWebhookReq = {
  webhook_type: any;
  webhook_code: any;
  item_id: string;
  environment: any;
  initial_update_complete: boolean;
  historical_update_complete: boolean;
};
export type OtherWebhookRew = {
  webhook_type: string;
  webhook_code: string;
  item_id: string;
  environment: any;
  [key: string]: any;
};
export type TransactionPlaidOut = {
  id: number;
  plaid_id: string;
  plaid_metadata: string;
  is_synced: boolean;
  timestamp: string;
  name: string;
  category_id?: number | null;
  bucket_id: number;
  transaction_group_id: number | null;
  amount_default_currency: string;
  amount: string;
  account_balance: string;
  account_id: number;
  is_group: false;
};
export type TransactionPlaidIn = {
  plaid_id: string;
  plaid_metadata: string;
  timestamp: string;
  name: string;
  category_id?: number | null;
  bucket_id: number;
  amount: number | string;
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
  timestamp: string;
  name: string;
  category_id?: number | null;
  bucket_id: number;
  amount: string;
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
  is_synced: boolean;
  name: string;
  icon_base64: Blob;
};
export type InstitutionApiOut = {
  id: number;
  is_synced: boolean;
  name: string;
  country_code: string;
  url: string | null;
  colour?: string | null;
  logo_base64?: string | null;
  transaction_deserialiser_id: number | null;
  replacement_pattern_id: number | null;
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
  is_synced: boolean;
  balance: string;
  user_institution_link_id: number;
  is_institutional: true;
  currency_code: string;
  initial_balance: string;
  name: string;
  type: "depository";
  default_bucket_id: number;
  mask: string;
};
export type LoanApiOut = {
  id: number;
  is_synced: boolean;
  balance: string;
  user_institution_link_id: number;
  is_institutional: true;
  currency_code: string;
  initial_balance: string;
  name: string;
  type: "loan";
  default_bucket_id: number;
  mask: string;
};
export type CreditApiOut = {
  id: number;
  is_synced: boolean;
  balance: string;
  user_institution_link_id: number;
  is_institutional: true;
  currency_code: string;
  initial_balance: string;
  name: string;
  type: "credit";
  default_bucket_id: number;
  mask: string;
};
export type BrokerageApiOut = {
  id: number;
  is_synced: boolean;
  balance: string;
  user_institution_link_id: number;
  is_institutional: true;
  currency_code: string;
  initial_balance: string;
  name: string;
  type: "brokerage";
  default_bucket_id: number;
  mask: string;
};
export type InvestmentApiOut = {
  id: number;
  is_synced: boolean;
  balance: string;
  user_institution_link_id: number;
  is_institutional: true;
  currency_code: string;
  initial_balance: string;
  name: string;
  type: "investment";
  default_bucket_id: number;
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
  default_bucket_id: number;
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
  default_bucket_id: number;
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
  default_bucket_id: number;
};
export type DepositoryApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "depository";
  default_bucket_id: number;
  mask: string;
};
export type LoanApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "loan";
  default_bucket_id: number;
  mask: string;
};
export type CreditApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "credit";
  default_bucket_id: number;
  mask: string;
};
export type BrokerageApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "brokerage";
  default_bucket_id: number;
  mask: string;
};
export type InvestmentApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "investment";
  default_bucket_id: number;
  mask: string;
};
export type CashApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "cash";
  default_bucket_id: number;
};
export type PersonalLedgerApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "personal ledger";
  default_bucket_id: number;
};
export type PropertyApiIn = {
  currency_code: string;
  initial_balance: number | string;
  name: string;
  type: "property";
  default_bucket_id: number;
};
export type TransactionApiIn = {
  timestamp: string;
  name: string;
  category_id?: number | null;
  bucket_id: number;
  amount: string;
};
export type BodyPreviewUsersMeAccountsAccountIdTransactionsPreviewPost = {
  file: Blob;
};
export type TransactionApiOut = {
  id: number;
  is_synced: boolean;
  timestamp: string;
  name: string;
  category_id?: number | null;
  bucket_id: number;
  transaction_group_id: number | null;
  amount_default_currency: string;
  amount: string;
  account_balance: string;
  account_id: number;
  is_group: false;
};
export type TransactionApiIn2 = {
  timestamp: string;
  name: string;
  category_id?: number | null;
  bucket_id: number;
  amount: number | string;
};
export type FileApiOut = {
  id: number;
  name: string;
  uploaded: string;
  transaction_id: number;
};
export type BodyCreateUsersMeAccountsAccountIdTransactionsTransactionIdFilesPost =
  {
    file: Blob;
  };
export type DetailedPlStatementApiOut = {
  timestamp__ge: string;
  timestamp__lt: string;
  income: string;
  expenses: string;
  income_by_category: {
    [key: string]: string;
  };
  expenses_by_category: {
    [key: string]: string;
  };
};
export type PlStatementApiOut = {
  timestamp__ge: string;
  timestamp__lt: string;
  income: string;
  expenses: string;
};
export type BucketApiOut = {
  id: number;
  name: string;
};
export type BucketApiIn = {
  name: string;
};
export type UserInstitutionLinkApiOut = {
  id: number;
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
export type TransactionGroupApiOut = {
  id: number;
  name: string;
  category_id: number | null;
  timestamp: string;
  transactions_count: number;
  amount_default_currency: string;
  amount: string | null;
  account_id: number | null;
  is_group: true;
};
export type TransactionGroupApiIn = {
  name: string;
  category_id?: number | null;
};
