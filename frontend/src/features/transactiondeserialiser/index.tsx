import { useState } from "react";
import { Card, Icon, Loader } from "semantic-ui-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import TransactionDeserialiserForm from "./Form";
import { api, TransactionDeserialiserApiOut } from "app/services/api";
import { renderErrorMessage } from "utils/error";
import EmptyTablePlaceholder from "components/TablePlaceholder";
import EditCell from "components/EditCell";
import DeleteCell from "components/DeleteCell";

export default function TransactionDeserialisers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransactionDeserialiser, setSelectedTransactionDeserialiser] =
    useState<TransactionDeserialiserApiOut | undefined>(undefined);

  const transactionDeserialisersQuery =
    api.endpoints.readManyApiTransactionDeserialisersGet.useQuery();
  const [deleteTransactionDeserialiser, deleteTransactionDeserialiserResult] =
    api.endpoints.deleteApiTransactionDeserialisersIdDelete.useMutation();

  const handleCreate = () => {
    setSelectedTransactionDeserialiser(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (
    transactionDeserialiser: TransactionDeserialiserApiOut
  ) => {
    setSelectedTransactionDeserialiser(transactionDeserialiser);
    setIsModalOpen(true);
  };

  const handleDelete = async (
    transactionDeserialiser: TransactionDeserialiserApiOut
  ) => {
    try {
      await deleteTransactionDeserialiser(transactionDeserialiser.id).unwrap();
    } catch (error) {
      console.error(deleteTransactionDeserialiserResult.originalArgs);
      throw error;
    }
  };

  const handleClose = () => {
    setSelectedTransactionDeserialiser(undefined);
    setIsModalOpen(false);
  };

  if (transactionDeserialisersQuery.isLoading)
    return <Loader active size="huge" />;

  if (transactionDeserialisersQuery.isError)
    console.error(transactionDeserialisersQuery.originalArgs);

  return (
    <>
      {transactionDeserialisersQuery.data?.length ? (
        <>
          {transactionDeserialisersQuery.data.map(
            (transactionDeserialiser, index) => (
              <Card fluid key={transactionDeserialiser.id}>
                <Card.Content>
                  <Card.Header>
                    {transactionDeserialiser.module_name}
                  </Card.Header>
                  <SyntaxHighlighter language="python" style={tomorrow}>
                    {`
skip_rows = ${transactionDeserialiser.skip_rows}
columns = ${transactionDeserialiser.columns}

def deserialize_name(row: list[str]) -> str:
    return ${transactionDeserialiser.name_deserialiser}

def deserialize_amount(row: list[str]) -> Decimal:
    return ${transactionDeserialiser.amount_deserialiser}

def deserialize_datetime(row: list[str]) -> datetime:
    return ${transactionDeserialiser.datetime_deserialiser}

def deserialize_code(row: list[str]) -> str:
    return ${transactionDeserialiser.code_deserialiser}

def deserialize_currency_code(row: list[str]) -> str:
    return ${transactionDeserialiser.currency_code_deserialiser}

def deserialize_payment_channel(row: list[str]) -> str:
    return ${transactionDeserialiser.payment_channel_deserialiser}
`}
                  </SyntaxHighlighter>
                </Card.Content>
                <Card.Content extra>
                  <EditCell
                    onEdit={() => handleEdit(transactionDeserialiser)}
                  />
                  <DeleteCell
                    isError={deleteTransactionDeserialiserResult.isError}
                    isLoading={deleteTransactionDeserialiserResult.isLoading}
                    error={
                      deleteTransactionDeserialiserResult.isError
                        ? renderErrorMessage(
                            deleteTransactionDeserialiserResult.error
                          )
                        : ""
                    }
                    onDelete={async () =>
                      await handleDelete(transactionDeserialiser)
                    }
                  />
                </Card.Content>
              </Card>
            )
          )}
        </>
      ) : (
        <EmptyTablePlaceholder onCreate={handleCreate} />
      )}
      <TransactionDeserialiserForm
        transactionDeserialiser={selectedTransactionDeserialiser}
        open={isModalOpen}
        onClose={handleClose}
      />
    </>
  );
}
