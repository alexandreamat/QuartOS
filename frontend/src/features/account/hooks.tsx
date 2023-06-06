import { skipToken } from "@reduxjs/toolkit/dist/query";
import { AccountApiOut, api } from "app/services/api";
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

function AccountOption(props: { account: AccountApiOut }) {
  const accountQueries = useAccountQueries(props.account.id);
  return (
    <>
      {accountQueries.institution?.name} / ··· {accountQueries.account?.mask}
    </>
  );
}

export function useAccountOptions() {
  const accountsQuery = api.endpoints.readManyApiAccountsGet.useQuery();
  const accountOptions = accountsQuery.data?.map((account) => {
    const option = <AccountOption account={account} />;
    return {
      key: account.id,
      value: account.id,
      content: option,
      text: option,
    };
  });
  return {
    data: accountOptions,
    isLoading: accountsQuery.isLoading,
    isError: accountsQuery.isError,
    isSuccess: accountsQuery.isSuccess,
    error: accountsQuery.isError
      ? renderErrorMessage(accountsQuery.error)
      : undefined,
  };
}
