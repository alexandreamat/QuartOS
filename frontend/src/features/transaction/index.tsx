import { useCallback, useEffect, useState } from "react";
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
    <>
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
      </Menu>
      <Uploader open={isUploaderOpen} onClose={handleCloseUploader} />
    </>
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

  const next = () => {
    console.log("next");
    setCurrentPage(currentPage + 1);
  };

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
    <>
      <Bar onCreate={props.onCreate} />
      <InfiniteScroll
        loader={<></>}
        dataLength={allTransactions.length}
        next={next}
        hasMore={true}
      >
        <TransactionsTable
          transactions={allTransactions}
          onEdit={props.onEdit}
        />
      </InfiniteScroll>
    </>
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
    <>
      <TransactionsInfiniteTable onCreate={handleCreate} onEdit={handleEdit} />
      <TransactionForm
        transaction={selectedTransaction}
        open={isFormOpen}
        onClose={handleCloseForm}
      />
    </>
  );
}
