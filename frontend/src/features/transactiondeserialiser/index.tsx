import { useState } from "react";
import { Card, Loader, Menu } from "semantic-ui-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import Form from "./Form";
import { api, TransactionDeserialiserApiOut } from "app/services/api";
import { logMutationError } from "utils/error";
import EditActionButton from "components/EditActionButton";
import ConfirmDeleteButton from "components/ConfirmDeleteButton";
import FlexColumn from "components/FlexColumn";
import CreateNewButton from "components/CreateNewButton";
import { QueryErrorMessage } from "components/QueryErrorMessage";

function TransactionDeserialiser(props: {
  transactionDeserialiser: TransactionDeserialiserApiOut;
  onOpenEditForm: (x: TransactionDeserialiserApiOut) => void;
}) {
  const [deleteTransactionDeserialiser, deleteTransactionDeserialiserResult] =
    api.endpoints.deleteApiTransactionDeserialisersIdDelete.useMutation();

  const handleDelete = async (
    transactionDeserialiser: TransactionDeserialiserApiOut
  ) => {
    try {
      await deleteTransactionDeserialiser(transactionDeserialiser.id).unwrap();
    } catch (error) {
      logMutationError(error, deleteTransactionDeserialiserResult);
      return;
    }
  };

  return (
    <Card fluid key={props.transactionDeserialiser.id}>
      <Card.Content>
        <Card.Header>{props.transactionDeserialiser.module_name}</Card.Header>
        <SyntaxHighlighter language="python" style={tomorrow}>
          {`skip_rows = ${props.transactionDeserialiser.skip_rows}
columns = ${props.transactionDeserialiser.columns}
delimiter = "${props.transactionDeserialiser.delimiter}"
encoding = "${props.transactionDeserialiser.encoding}"

def deserialize_name(row: list[str]) -> str:
    return ${props.transactionDeserialiser.name_deserialiser}

def deserialize_amount(row: list[str]) -> Decimal:
    return ${props.transactionDeserialiser.amount_deserialiser}

def deserialize_timestamp(row: list[str]) -> date:
    return ${props.transactionDeserialiser.timestamp_deserialiser}
`}
        </SyntaxHighlighter>
      </Card.Content>
      <Card.Content extra>
        <EditActionButton
          onOpenEditForm={() =>
            props.onOpenEditForm(props.transactionDeserialiser)
          }
        />
        <ConfirmDeleteButton
          query={deleteTransactionDeserialiserResult}
          onDelete={async () =>
            await handleDelete(props.transactionDeserialiser)
          }
        />
      </Card.Content>
    </Card>
  );
}

export default function TransactionDeserialisers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransactionDeserialiser, setSelectedTransactionDeserialiser] =
    useState<TransactionDeserialiserApiOut | undefined>(undefined);

  const query = api.endpoints.readManyApiTransactionDeserialisersGet.useQuery();

  function handleOpenEditForm(
    transactionDeserialiser: TransactionDeserialiserApiOut
  ) {
    setSelectedTransactionDeserialiser(transactionDeserialiser);
    setIsModalOpen(true);
  }

  function handleCreate() {
    setSelectedTransactionDeserialiser(undefined);
    setIsModalOpen(true);
  }

  function handleClose() {
    setSelectedTransactionDeserialiser(undefined);
    setIsModalOpen(false);
  }

  if (query.isUninitialized || query.isLoading)
    return <Loader active size="huge" />;

  if (query.isError) return <QueryErrorMessage query={query} />;

  const deserialisers = query.data;

  return (
    <FlexColumn>
      <Form
        transactionDeserialiser={selectedTransactionDeserialiser}
        open={isModalOpen}
        onClose={handleClose}
      />
      <Menu secondary>
        <Menu.Item>
          <CreateNewButton onCreate={handleCreate} />
        </Menu.Item>
      </Menu>
      <FlexColumn.Auto>
        {deserialisers.map((transactionDeserialiser) => (
          <TransactionDeserialiser
            transactionDeserialiser={transactionDeserialiser}
            onOpenEditForm={handleOpenEditForm}
          />
        ))}
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
