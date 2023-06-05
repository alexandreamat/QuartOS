import { skipToken } from "@reduxjs/toolkit/dist/query";
import { api } from "app/services/api";
import { renderErrorMessage } from "utils/error";

export default function useInstitutionLinkQueries(id?: number) {
    const institutionLinkQuery =
      api.endpoints.readApiInstitutionLinksIdGet.useQuery(id || skipToken);
    const institutionQuery = api.endpoints.readApiInstitutionsIdGet.useQuery(
      institutionLinkQuery.data?.institution_id || skipToken
    );
  
    const isLoading = institutionLinkQuery.isLoading || institutionQuery.isLoading;
    const isSuccess = institutionLinkQuery.isSuccess && institutionQuery.isSuccess;
    const isError = institutionLinkQuery.isError || institutionQuery.isError;
  
    const error = [
      institutionLinkQuery.isError
        ? renderErrorMessage(institutionLinkQuery.error)
        : undefined,
      institutionQuery.isError
        ? renderErrorMessage(institutionQuery.error)
        : undefined,
    ]
      .filter(Boolean)
      .join(" ");
  
    return {
      isLoading,
      isSuccess,
      isError,
      error,
      institutionLink: institutionLinkQuery.data,
      institution: institutionQuery.data,
    };
  }
  