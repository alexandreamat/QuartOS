import { useEffect, useState } from "react";
import { Icon, Button, Menu, Dropdown, DropdownProps } from "semantic-ui-react";
import TransactionForm from "./Form";
import { TransactionApiOut, api } from "app/services/api";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import InfiniteScroll from "react-infinite-scroll-component";
import Uploader from "./Uploader";
import TransactionsTable from "./Table";
import { useAccountOptions } from "features/account/hooks";

function Bar(props: {
  onCreate: () => void;
  accountId: number;
  onAccountIdChange: (x: number) => void;
}) {
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const handleUpload = () => {
    setIsUploaderOpen(true);
  };

  const handleCloseUploader = () => {
    setIsUploaderOpen(false);
  };

  const accountOptions = useAccountOptions();

  return (
    <Menu tabular>
      <Menu.Item>
        <Button icon labelPosition="left" primary onClick={props.onCreate}>
          <Icon name="plus" />
          Add
        </Button>
      </Menu.Item>
      <Menu.Item>
        <Dropdown
          icon="filter"
          labeled
          className="icon"
          button
          placeholder="Filter by account"
          search
          selection
          value={props.accountId}
          options={accountOptions.data || []}
          onChange={(
            event: React.SyntheticEvent<HTMLElement>,
            data: DropdownProps
          ) => props.onAccountIdChange(data.value as number)}
        />
      </Menu.Item>
      {props.accountId !== 0 && (
        <Menu.Item fitted onClick={() => props.onAccountIdChange(0)}>
          <Icon name="close" />
        </Menu.Item>
      )}
      <Menu.Item position="right">
        <Button icon labelPosition="left" onClick={handleUpload}>
          <Icon name="upload" />
          Upload Transactions Sheet
        </Button>
      </Menu.Item>
      <Uploader open={isUploaderOpen} onClose={handleCloseUploader} />
    </Menu>
  );
}

function TransactionsInfiniteTable(props: {
  onCreate: () => void;
  onEdit: (transaction: TransactionApiOut) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState<TransactionApiOut[]>(
    []
  );
  const [accountId, setAccountId] = useState(0);

  const handleAccountIdChange = (value: number) => {
    setAllTransactions([]);
    setAccountId(value);
  };

  const transactionsQuery = accountId
    ? api.endpoints.readTransactionsApiAccountsIdTransactionsGet.useQuery({
        id: accountId,
        page: currentPage,
        perPage: 20,
      })
    : api.endpoints.readManyApiTransactionsGet.useQuery({
        page: currentPage,
        perPage: 20,
      });

  useEffect(() => {
    if (transactionsQuery.data) {
      setAllTransactions((prevTransactions) => [
        ...prevTransactions,
        ...transactionsQuery.data!,
      ]);
    }
  }, [transactionsQuery.data]);

  useEffect(() => {}, [transactionsQuery.isFetching]);

  if (transactionsQuery.isError) console.error(transactionsQuery.originalArgs);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Bar
        onCreate={props.onCreate}
        accountId={accountId}
        onAccountIdChange={handleAccountIdChange}
      />
      <div style={{ flex: 1, overflow: "auto" }}>
        {allTransactions.length ? (
          <InfiniteScroll
            loader={<></>}
            dataLength={allTransactions.length}
            next={() => setCurrentPage(currentPage + 1)}
            hasMore={true}
          >
            <TransactionsTable
              transactions={allTransactions}
              onEdit={props.onEdit}
            />
          </InfiniteScroll>
        ) : (
          <EmptyTablePlaceholder />
        )}
      </div>
    </div>
  );
}

export default function Transactions() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    TransactionApiOut | undefined
  >(undefined);

  const handleCreate = () => {
    setSelectedTransaction(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (transaction: TransactionApiOut) => {
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedTransaction(undefined);
    setIsFormOpen(false);
  };

  return (
    <div style={{ height: "100%" }}>
      <TransactionsInfiniteTable onCreate={handleCreate} onEdit={handleEdit} />
      <TransactionForm
        transaction={selectedTransaction}
        open={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  );
}
