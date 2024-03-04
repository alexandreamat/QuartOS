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
import { useInstitutionLinkQueries } from "features/institutionlink/hooks";
import { DropdownItemProps } from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";
import AccountIcon from "./components/Icon";

export function useAccountQueries(accountId?: number) {
  const accountQuery = api.endpoints.readUsersMeAccountsAccountIdGet.useQuery(
    accountId || skipToken,
  );

  const institutionLinkQueries = useInstitutionLinkQueries(
    accountQuery.data?.is_institutional
      ? accountQuery.data.user_institution_link_id
      : undefined,
  );

  const isLoading =
    accountQuery.isLoading ||
    (accountQuery.isSuccess &&
      accountQuery.data.is_institutional &&
      institutionLinkQueries.isLoading);
  const isSuccess =
    (accountQuery.isSuccess &&
      accountQuery.data.is_institutional &&
      institutionLinkQueries.isSuccess) ||
    accountQuery.isSuccess;
  const isError =
    accountQuery.isError ||
    (accountQuery.isSuccess &&
      accountQuery.data.is_institutional &&
      institutionLinkQueries.isError);

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

export function useAccountOptions() {
  const query = api.endpoints.readManyUsersMeAccountsGet.useQuery();

  const options: DropdownItemProps[] =
    query.data?.map((a) => ({
      key: a.id,
      value: a.id,
      content: a.name,
      text: a.name,
      image: <AccountIcon account={a} />,
    })) || [];

  return {
    options,
    query,
  };
}
