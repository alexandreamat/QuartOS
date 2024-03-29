// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { skipToken } from "@reduxjs/toolkit/dist/query";
import { api } from "app/services/api";
import { renderErrorMessage } from "utils/error";
import InstitutionLinkOption from "./components/InstitutionLinkOption";

export function useInstitutionLinkQueries(institutionLinkId?: number) {
  const institutionLinkQuery =
    api.endpoints.readUsersMeInstitutionLinksUserInstitutionLinkIdGet.useQuery(
      institutionLinkId || skipToken,
    );
  const institutionQuery =
    api.endpoints.readInstitutionsInstitutionIdGet.useQuery(
      institutionLinkQuery.data?.institution_id || skipToken,
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
    api.endpoints.readManyUsersMeInstitutionLinksGet.useQuery();

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
    query: institutionLinksQuery,
  };
}
