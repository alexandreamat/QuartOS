import { skipToken } from "@reduxjs/toolkit/dist/query";
import { api } from "app/services/api";
import useInstitutionLinkQueries from "features/account/hooks";
import { renderErrorMessage } from "utils/error";

export default function useAccountQueries(id?: number) {
    const accountQuery = api.endpoints.readApiAccountsIdGet.useQuery(id || skipToken);
    
    const institutionLinkQueries = useInstitutionLinkQueries(accountQuery.data?.user_institution_link_id)

    const isLoading = accountQuery.isLoading || institutionLinkQueries.isLoading;
    const isSuccess = accountQuery.isSuccess && institutionLinkQueries.isSuccess;
    const isError = accountQuery.isError || institutionLinkQueries.isError;
  
    const error = [
      accountQuery.isError ? renderErrorMessage(accountQuery.error) : undefined,
      institutionLinkQueries.isError ? institutionLinkQueries.error : undefined,
    ]
      .filter(Boolean)
      .join(" ");
  
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
  