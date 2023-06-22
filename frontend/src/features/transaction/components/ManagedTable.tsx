import { TransactionApiOut } from "app/services/api";
import { useState } from "react";
import { useTransactionsQuery } from "../hooks";
import Bar from "./Bar";
import Table from "./Table";
import FlexColumn from "components/FlexColumn";
import Form from "./Form";
import { useInfiniteQuery } from "hooks/useInfiniteQuery";
import { QueryErrorMessage } from "components/QueryErrorMessage";

export default function ManagedTable(props: {
  relatedTransactions?: TransactionApiOut[];
  onMutation?: (x: TransactionApiOut) => void;
  onAddFlow?: (x: TransactionApiOut) => void;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [selectedTransaction, setSelectedTransaction] = useState<
    TransactionApiOut | undefined
  >(undefined);

  const [selectedAccountId, setSelectedAccountId] = useState(0);
  const [accountId, setAccountId] = useState(0);
  const [search, setSearch] = useState("");
  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(true);

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
    infiniteQuery.reset();
    setAccountId(value);
  };

  const handleSearchChange = (value: string) => {
    infiniteQuery.reset();
    setSearch(value);
  };

  function handleTimestampChange(value: Date | undefined) {
    infiniteQuery.reset();
    setTimestamp(value);
  }

  function handleToggleIsDescending() {
    infiniteQuery.reset();
    setIsDescending((prev) => !prev);
  }

  const infiniteQuery = useInfiniteQuery<
    TransactionApiOut,
    Parameters<typeof useTransactionsQuery>[0]
  >(
    useTransactionsQuery,
    {
      timestamp,
      accountId: accountId,
      search,
      isDescending,
    },
    20,
    props.onMutation
  );

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
          isDescending={isDescending}
          onToggleIsDescending={handleToggleIsDescending}
        />
        <FlexColumn.Auto reference={infiniteQuery.reference}>
          {infiniteQuery.isError && <QueryErrorMessage query={infiniteQuery} />}
          <Table
            transactionPages={Object.values(infiniteQuery.pages)}
            onOpenEditForm={handleOpenEditForm}
            onOpenCreateForm={handleOpenCreateForm}
            onMutation={infiniteQuery.reset}
            onAddFlow={props.onAddFlow}
          />
        </FlexColumn.Auto>
      </FlexColumn>
      <Form
        relatedTransactions={props.relatedTransactions}
        transaction={selectedTransaction}
        open={isFormOpen}
        onClose={handleCloseForm}
        accountId={selectedAccountId}
        onMutation={infiniteQuery.mutate}
      />
    </>
  );
}
