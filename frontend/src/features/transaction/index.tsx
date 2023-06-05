import { useCallback, useEffect, useState } from "react";
import { Icon, Segment, Button } from "semantic-ui-react";
import TransactionForm from "./Form";
import { TransactionApiOut, api } from "app/services/api";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import InfiniteScroll from "react-infinite-scroll-component";
import Uploader from "./Uploader";
import TransactionsTable from "./Table";

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

  const next = useCallback(() => {
    setCurrentPage(currentPage + 1);
  }, [currentPage]);

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
    <InfiniteScroll
      loader={<></>}
      dataLength={allTransactions.length}
      next={next}
      hasMore={true}
    >
      <TransactionsTable transactions={allTransactions} onEdit={props.onEdit} />
    </InfiniteScroll>
  );
}

export default function Transactions() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    TransactionApiOut | undefined
  >(undefined);

  const handleCreate = () => {
    setSelectedTransaction(undefined);
    setIsFormOpen(true);
  };

  const handleUpload = () => {
    setIsUploaderOpen(true);
  };

  const handleEdit = (transaction: TransactionApiOut) => {
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedTransaction(undefined);
    setIsFormOpen(false);
  };

  const handleCloseUploader = () => {
    setIsUploaderOpen(false);
  };

  return (
    <>
      <Segment>
        <Button icon primary labelPosition="left" onClick={handleCreate}>
          <Icon name="plus" />
          Create New
        </Button>
        <Button
          icon
          labelPosition="left"
          floated="right"
          onClick={handleUpload}
        >
          <Icon name="upload" />
          Upload Transactions Sheet
        </Button>
      </Segment>
      <TransactionsInfiniteTable onCreate={handleCreate} onEdit={handleEdit} />
      <TransactionForm
        transaction={selectedTransaction}
        open={isFormOpen}
        onClose={handleCloseForm}
      />
      <Uploader open={isUploaderOpen} onClose={handleCloseUploader} />
    </>
  );
}
