// Copyright (C) 2023 Alexandre Amat
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
import { AccountApiOut, api } from "app/services/api";
import { useInstitutionLinkQueries } from "features/institutionlink/hooks";
import { DropdownItemProps } from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";

export function useAccountQueries(accountId?: number) {
  const accountQuery =
    api.endpoints.readApiUsersMeAccountsAccountIdGet.useQuery(
      accountId || skipToken,
    );

  const institutionLinkQueries = useInstitutionLinkQueries(
    accountQuery.data && "userinstitutionlink_id" in accountQuery.data
      ? accountQuery.data.userinstitutionlink_id
      : undefined,
  );

  const error = [
    accountQuery.isError ? renderErrorMessage(accountQuery.error) : undefined,
    institutionLinkQueries.isError ? institutionLinkQueries.error : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    isLoading: accountQuery.isLoading || institutionLinkQueries.isLoading,
    isSuccess:
      accountQuery.isSuccess &&
      (institutionLinkQueries.isUninitiaized ||
        institutionLinkQueries.isSuccess),
    isError: accountQuery.isError || institutionLinkQueries.isError,
    error,
    account: accountQuery.data,
    institutionLink: institutionLinkQueries.institutionLink,
    institution: institutionLinkQueries.institution,
  };
}

function AccountOptionContent(props: { account: AccountApiOut }) {
  const accountQueries = useAccountQueries(props.account.id);
  return (
    <p className="description">
      {"userinstitutionlink_id" in props.account &&
        accountQueries.institution?.name}
    </p>
  );
}

export function useAccountOptions() {
  const query = api.endpoints.readManyApiUsersMeAccountsGet.useQuery();

  const options: DropdownItemProps[] =
    query.data?.map((account) => ({
      key: account.id,
      value: account.id,
      text: account.name,
      description: <AccountOptionContent account={account} />,
    })) || [];

  return {
    options,
    query,
  };
}
