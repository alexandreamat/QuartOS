import { TransactionApiOut } from "app/services/api";
import { useEffect, useRef, useState } from "react";
import { Message } from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";
import { useTransactionsQuery } from "../hooks";
import Bar from "./Bar";
import Table from "./Table";
import FlexColumn from "components/FlexColumn";
import Form from "./Form";

export default function ManagedTable(props: {
  relatedTransactions?: TransactionApiOut[];
  onMutation?: (x: TransactionApiOut) => void;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    TransactionApiOut | undefined
  >(undefined);
  const [selectedAccountId, setSelectedAccountId] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState<
    Record<number, TransactionApiOut[]>
  >({});
  const [accountId, setAccountId] = useState(0);
  const [search, setSearch] = useState("");
  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined);

  const reference = useRef<HTMLDivElement | null>(null);

  const handleMutation = (transaction: TransactionApiOut) => {
    if (props.onMutation) props.onMutation(transaction);
    setResetKey((x) => x + 1);
  };

  const handleReset = () => {
    setTransactions([]);
    setPage(1);
    transactionsQuery.refetch();
  };

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
    setPage(1);
    setAccountId(value);
  };

  const handleSearchChange = (value: string) => {
    setTransactions([]);
    setPage(1);
    setSearch(value);
  };

  function handleTimestampChange(value: Date | undefined) {
    setTransactions([]);
    setPage(1);
    setTimestamp(value);
  }

  const transactionsQuery = useTransactionsQuery(
    accountId,
    search,
    page,
    timestamp
  );

  useEffect(() => {
    const handleScroll = (event: Event) => {
      if (
        !transactionsQuery.isSuccess ||
        transactionsQuery.isLoading ||
        transactionsQuery.isFetching
      )
        return;
      const target = event.target as HTMLDivElement;
      if (target.scrollHeight - target.scrollTop < 1.5 * target.clientHeight) {
        setPage((prevPage) => prevPage + 1);
      }
    };
    const scrollContainer = reference.current;

    if (scrollContainer)
      scrollContainer.addEventListener("scroll", handleScroll);

    return () => {
      if (scrollContainer)
        scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [
    transactionsQuery.isSuccess,
    transactionsQuery.isLoading,
    transactionsQuery.isFetching,
  ]);

  useEffect(() => handleReset(), [resetKey]);

  useEffect(() => {
    if (transactionsQuery.data) {
      setTransactions((prevTransactions) => ({
        ...prevTransactions,
        [page]: transactionsQuery.data!,
      }));
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
          timestamp={timestamp}
          onTimestampChange={handleTimestampChange}
        />
        <FlexColumn.Auto reference={reference}>
          {transactionsQuery.isError && (
            <Message
              negative
              header="An error has occurred!"
              content={renderErrorMessage(transactionsQuery.error)}
              icon="attention"
            />
          )}
          <Table
            transactionPages={Object.values(transactions)}
            onOpenEditForm={handleOpenEditForm}
            onOpenCreateForm={handleOpenCreateForm}
            onMutation={handleReset}
          />
        </FlexColumn.Auto>
      </FlexColumn>
      <Form
        relatedTransactions={props.relatedTransactions}
        transaction={selectedTransaction}
        open={isFormOpen}
        onClose={handleCloseForm}
        accountId={selectedAccountId}
        onMutation={handleMutation}
      />
    </>
  );
}
