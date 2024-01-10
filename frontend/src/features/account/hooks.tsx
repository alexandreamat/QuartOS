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
import { AccountApiOut, api } from "app/services/api";
import { useInstitutionLinkQueries } from "features/institutionlink/hooks";
import { renderErrorMessage } from "utils/error";

export function useAccountQueries(accountId?: number) {
  const accountQuery = api.endpoints.readUsersMeAccountsAccountIdGet.useQuery(
    accountId || skipToken,
  );

  const institutionLinkQueries = useInstitutionLinkQueries(
    accountQuery.data?.institutionalaccount?.userinstitutionlink_id,
  );

  const isLoading =
    accountQuery.isLoading ||
    (accountQuery.isSuccess &&
      Boolean(accountQuery.data.institutionalaccount) &&
      institutionLinkQueries.isLoading);
  const isSuccess =
    (accountQuery.isSuccess &&
      Boolean(accountQuery.data.institutionalaccount) &&
      institutionLinkQueries.isSuccess) ||
    accountQuery.isSuccess;
  const isError =
    accountQuery.isError ||
    (accountQuery.isSuccess &&
      Boolean(accountQuery.data.institutionalaccount) &&
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

function AccountOption(props: { account: AccountApiOut }) {
  const accountQueries = useAccountQueries(props.account.id);
  if (accountQueries.account?.institutionalaccount)
    return (
      <p>
        {accountQueries.institution?.name} / ···{" "}
        {accountQueries.account.institutionalaccount.mask}
      </p>
    );

  if (accountQueries.account?.noninstitutionalaccount)
    return <p>{accountQueries.account.name}</p>;

  return <p></p>;
}

export function useAccountOptions() {
  const query = api.endpoints.readManyUsersMeAccountsGet.useQuery();

  const options = query.data?.map((account) => {
    const option = <AccountOption account={account} />;
    return {
      key: account.id,
      value: account.id,
      content: option,
      text: account.name,
    };
  });

  return {
    options,
    query,
  };
}
