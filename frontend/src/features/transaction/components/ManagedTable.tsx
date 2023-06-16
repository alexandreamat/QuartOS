import { TransactionApiOut } from "app/services/api";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Message } from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";
import { useTransactionsQuery } from "../hooks";
import Bar from "./Bar";
import Table from "./Table";
import FlexColumn from "components/FlexColumn";
import Form from "./Form";

export default function ManagedTable() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    TransactionApiOut | undefined
  >(undefined);
  const [selectedAccountId, setSelectedAccountId] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<TransactionApiOut[]>([]);
  const [accountId, setAccountId] = useState(0);
  const [search, setSearch] = useState("");

  const handleMutation = () => setResetKey((x) => x + 1);

  const handleOpenCreateForm = (accountId: number) => {
    setSelectedAccountId(accountId);
    setSelectedTransaction(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (transaction: TransactionApiOut) => {
    setSelectedAccountId(0);
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedAccountId(0);
    setSelectedTransaction(undefined);
    setIsFormOpen(false);
  };

  const handleAccountIdChange = (value: number) => {
    setTransactions([]);
    setCurrentPage(1);
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
    setTransactions([]);
    setCurrentPage(1);
    setSearch("");
  }, [resetKey]);

  useEffect(() => {
    if (transactionsQuery.data) {
      setTransactions((prevTransactions) => [
        ...prevTransactions,
        ...transactionsQuery.data!,
      ]);
    }
  }, [transactionsQuery.data]);

  if (transactionsQuery.isError) console.error(transactionsQuery.originalArgs);

  return (
    <>
      <FlexColumn>
        <Bar
          onOpenCreateForm={handleOpenCreateForm}
          accountId={accountId}
          onAccountIdChange={handleAccountIdChange}
          search={search}
          onSearchChange={handleSearchChange}
        />
        <FlexColumn.Auto>
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
                onOpenEditForm={handleOpenEditForm}
                onOpenCreateForm={handleOpenCreateForm}
                onMutation={() => {
                  setTransactions([]);
                  setCurrentPage(1);
                  transactionsQuery.refetch();
                }}
              />
            </InfiniteScroll>
          )}
        </FlexColumn.Auto>
      </FlexColumn>
      <Form
        transaction={selectedTransaction}
        open={isFormOpen}
        onClose={handleCloseForm}
        accountId={selectedAccountId}
        onMutation={handleMutation}
      />
    </>
  );
}
