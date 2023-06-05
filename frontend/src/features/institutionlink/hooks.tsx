import { skipToken } from "@reduxjs/toolkit/dist/query";
import { api } from "app/services/api";
import { renderErrorMessage } from "utils/error";
import InstitutionLinkOption from "./InstitutionLinkOption";

export function useInstitutionLinkQueries(institutionLinkId?: number) {
  const institutionLinkQuery =
    api.endpoints.readApiInstitutionLinksIdGet.useQuery(
      institutionLinkId || skipToken
    );
  const institutionQuery = api.endpoints.readApiInstitutionsIdGet.useQuery(
    institutionLinkQuery.data?.institution_id || skipToken
  );

  const isLoading =
    institutionLinkQuery.isLoading || institutionQuery.isLoading;
  const isSuccess =
    institutionLinkQuery.isSuccess && institutionQuery.isSuccess;
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

export function useInstitutionLinkOptions() {
  const institutionLinksQuery =
    api.endpoints.readManyApiInstitutionLinksGet.useQuery();

  const institutionLinkOptions = institutionLinksQuery.data?.map((link) => {
    const content = <InstitutionLinkOption institutionLink={link} />;
    return {
      key: link.id,
      value: link.id,
      content: content,
      text: content,
    };
  });

  return {
    data: institutionLinkOptions,
    isLoading: institutionLinksQuery.isLoading,
    isError: institutionLinksQuery.isError,
    isSuccess: institutionLinksQuery.isSuccess,
    error: institutionLinksQuery.isError
      ? renderErrorMessage(institutionLinksQuery.error)
      : undefined,
  };
}
