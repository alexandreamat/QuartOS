import { TransactionApiOut } from "app/services/api";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Message } from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";
import Table from "./Table";
import Bar from "./Bar";
import { useTransactionsQuery } from "./hooks";

export default function ManagedTable(props: {
  onOpenCreateForm: (accountId: number) => void;
  onOpenEditForm: (transaction: TransactionApiOut) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState<TransactionApiOut[]>(
    []
  );
  const [accountId, setAccountId] = useState(0);
  const [search, setSearch] = useState("");

  const handleAccountIdChange = (value: number) => {
    setAllTransactions([]);
    setAccountId(value);
  };

  const handleSearchChange = (value: string) => {
    setAllTransactions([]);
    setSearch(value);
  };

  const transactionsQuery = useTransactionsQuery(
    accountId,
    search,
    currentPage
  );

  useEffect(() => {
    if (transactionsQuery.data) {
      setAllTransactions((prevTransactions) => [
        ...prevTransactions,
        ...transactionsQuery.data!,
      ]);
    }
  }, [transactionsQuery.data]);

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
            dataLength={allTransactions.length}
            next={() => setCurrentPage(currentPage + 1)}
            hasMore={true}
          >
            <Table
              transactions={allTransactions}
              onOpenEditForm={props.onOpenEditForm}
              onDelete={() => setAllTransactions([])}
            />
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}
