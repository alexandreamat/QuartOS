import { skipToken } from "@reduxjs/toolkit/dist/query";
import { api } from "app/services/api";
import { useInstitutionLinkQueries } from "features/institutionlink/hooks";
import { renderErrorMessage } from "utils/error";

export function useAccountQueries(accountId?: number) {
  const accountQuery = api.endpoints.readApiAccountsIdGet.useQuery(
    accountId || skipToken
  );

  const institutionLinkQueries = useInstitutionLinkQueries(
    accountQuery.data?.user_institution_link_id
  );

  const isLoading = accountQuery.isLoading || institutionLinkQueries.isLoading;
  const isSuccess = accountQuery.isSuccess && institutionLinkQueries.isSuccess;
  const isError = accountQuery.isError || institutionLinkQueries.isError;

  const error = [
    accountQuery.isError ? renderErrorMessage(accountQuery.error) : undefined,
    institutionLinkQueries.isError ? institutionLinkQueries.error : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    isLoading,
    isSuccess,
    isError,
    error,
    account: accountQuery.data,
    institutionLink: institutionLinkQueries.institutionLink,
    institution: institutionLinkQueries.institution,
  };
}

export function useAccountOptions(institutionLinkid?: number) {
  const institutionLinkQuery =
    api.endpoints.readApiInstitutionLinksIdGet.useQuery(
      institutionLinkid || skipToken
    );
  const accountsQuery =
    api.endpoints.readAccountsApiInstitutionLinksIdAccountsGet.useQuery(
      institutionLinkQuery.data?.id || skipToken
    );

  const accountOptions = accountsQuery.data?.map((account) => {
    return {
      key: account.id,
      value: account.id,
      text: "··· " + account.mask,
    };
  });

  const error = [
    institutionLinkQuery.isError
      ? renderErrorMessage(institutionLinkQuery.error)
      : undefined,
    accountsQuery.isError ? accountsQuery.error : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    data: accountOptions,
    isLoading: institutionLinkQuery.isLoading || accountsQuery.isLoading,
    isError: institutionLinkQuery.isError || accountsQuery.isError,
    isSuccess: institutionLinkQuery.isSuccess && accountsQuery.isSuccess,
    error,
  };
}