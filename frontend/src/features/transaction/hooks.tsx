import { skipToken } from "@reduxjs/toolkit/dist/query";
import { api } from "app/services/api";
import { DropdownItemProps } from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";

export function useTransactionOptions(search: string) {
  const query = api.endpoints.readManyApiUsersMeTransactionsGet.useQuery(
    search.length
      ? {
          page: 1,
          perPage: 10,
          search: search,
        }
      : skipToken
  );

  const options = query.data?.map((transaction) => {
    return {
      key: transaction.id,
      value: transaction.id,
      text: `${transaction.name} ${transaction.amount.toLocaleString(
        undefined,
        { style: "currency", currency: transaction.currency_code }
      )}`,
    } as DropdownItemProps;
  });

  return {
    data: options || [],
    isLoading: query.isLoading,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.isError ? renderErrorMessage(query.error) : undefined,
  };
}

export function useTransactionsQuery(arg: {
  accountId: number;
  search: string;
  perPage?: number;
  page?: number;
  timestamp?: Date;
  isDescending: boolean;
}) {
  const transactionsQuery = arg.accountId
    ? api.endpoints.readManyApiUsersMeAccountsAccountIdTransactionsGet.useQuery(
        {
          accountId: arg.accountId,
          page: arg.page,
          perPage: arg.perPage,
          timestamp: arg.timestamp && arg.timestamp.toISOString(),
          search: arg.search,
          isDescending: arg.isDescending,
        }
      )
    : api.endpoints.readManyApiUsersMeTransactionsGet.useQuery({
        page: arg.page,
        perPage: arg.perPage,
        timestamp: arg.timestamp && arg.timestamp.toISOString(),
        search: arg.search,
        isDescending: arg.isDescending,
      });
  return transactionsQuery;
}
