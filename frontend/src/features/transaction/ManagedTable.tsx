import { TransactionApiOut } from "app/services/api";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Message } from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";
import Table from "./Table";
import Bar from "./Bar";
import { useTransactionsQuery } from "./hooks";

export default function ManagedTable(props: {
  onOpenCreateForm: (accountId: number, relatedTransactionId: number) => void;
  onOpenEditForm: (transaction: TransactionApiOut) => void;
  resetKey: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<TransactionApiOut[]>([]);
  const [accountId, setAccountId] = useState(0);
  const [search, setSearch] = useState("");

  const handleAccountIdChange = (value: number) => {
    setTransactions([]);
    setAccountId(value);
  };

  const handleSearchChange = (value: string) => {
    setTransactions([]);
    setCurrentPage(1);
    setSearch(value);
  };

  const transactionsQuery = useTransactionsQuery(
    accountId,
    search,
    currentPage
  );

  useEffect(() => {
    if (transactionsQuery.data) {
      setTransactions((prevTransactions) => [
        ...prevTransactions,
        ...transactionsQuery.data!,
      ]);
    }
  }, [transactionsQuery.data]);

  useEffect(() => {
    setTransactions([]);
    setCurrentPage(1);
    transactionsQuery.refetch();
  }, [props.resetKey]);

  if (transactionsQuery.isError) console.error(transactionsQuery.originalArgs);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Bar
        onOpenCreateForm={props.onOpenCreateForm}
        accountId={accountId}
        onAccountIdChange={handleAccountIdChange}
        search={search}
        onSearchChange={handleSearchChange}
      />
      <div style={{ flex: 1, overflow: "auto" }}>
        {transactionsQuery.isError ? (
          <Message
            negative
            header="An error has occurred!"
            content={renderErrorMessage(transactionsQuery.error)}
            icon="attention"
          />
        ) : (
          <InfiniteScroll
            loader={<></>}
            dataLength={transactions.length}
            next={() => setCurrentPage(currentPage + 1)}
            hasMore={true}
          >
            <Table
              transactions={transactions}
              onOpenEditForm={props.onOpenEditForm}
              onOpenCreateForm={props.onOpenCreateForm}
              onMutation={() => {
                setTransactions([]);
                setCurrentPage(1);
                transactionsQuery.refetch();
              }}
            />
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}
