import { useEffect, useState } from "react";
import { Icon, Button, Menu, Dropdown, DropdownProps } from "semantic-ui-react";
import TransactionForm from "./Form";
import { TransactionApiOut, api } from "app/services/api";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import InfiniteScroll from "react-infinite-scroll-component";
import Uploader from "./Uploader";
import TransactionsTable from "./Table";
import { useInstitutionLinkOptions } from "features/institutionlink/hooks";
import { useAccountOptions } from "features/account/hooks";

function Bar(props: { onCreate: () => void }) {
  const [institutionLinkId, setInstitutionLinkId] = useState(0);
  const [accountId, setAccountId] = useState(0);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const handleUpload = () => {
    setIsUploaderOpen(true);
  };

  const handleCloseUploader = () => {
    setIsUploaderOpen(false);
  };

  const institutionLinkOptions = useInstitutionLinkOptions();
  const accountOptions = useAccountOptions(institutionLinkId);

  return (
    <Menu borderless>
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
          placeholder="Filter by institution"
          search
          selection
          value={institutionLinkId}
          options={institutionLinkOptions.data || []}
          onChange={(
            event: React.SyntheticEvent<HTMLElement>,
            data: DropdownProps
          ) => setInstitutionLinkId(data.value as number)}
        />
      </Menu.Item>
      {institutionLinkId !== 0 && (
        <>
          <Menu.Item fitted onClick={() => setInstitutionLinkId(0)}>
            <Icon name="close" />
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
              value={accountId}
              options={accountOptions.data || []}
              onChange={(
                event: React.SyntheticEvent<HTMLElement>,
                data: DropdownProps
              ) => setAccountId(data.value as number)}
            />
          </Menu.Item>
          {accountId !== 0 && (
            <Menu.Item fitted onClick={() => setAccountId(0)}>
              <Icon name="close" />
            </Menu.Item>
          )}
        </>
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

  const transactionsQuery = api.endpoints.readManyApiTransactionsGet.useQuery({
    page: currentPage,
    perPage: 20,
  });

  // TODO api logic to query filtered api endpoints

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

  if (!allTransactions.length) return <EmptyTablePlaceholder />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Bar onCreate={props.onCreate} />
      <div style={{ flex: 1, overflow: "auto" }}>
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
