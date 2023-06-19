import { skipToken } from "@reduxjs/toolkit/dist/query";
import { api } from "app/services/api";
import { DropdownItemProps } from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";

export function useTransactionOptions(search: string) {
  const query = api.endpoints.readManyApiTransactionsGet.useQuery(
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
  page?: number;
  timestamp?: Date;
}) {
  const transactionsQuery = arg.accountId
    ? api.endpoints.readTransactionsApiAccountsIdTransactionsGet.useQuery({
        id: arg.accountId,
        page: arg.page,
        perPage: 20,
        timestamp: arg.timestamp && arg.timestamp.toISOString(),
        search: arg.search,
      })
    : api.endpoints.readManyApiTransactionsGet.useQuery({
        page: arg.page,
        perPage: 20,
        timestamp: arg.timestamp && arg.timestamp.toISOString(),
        search: arg.search,
      });
  return transactionsQuery;
}
