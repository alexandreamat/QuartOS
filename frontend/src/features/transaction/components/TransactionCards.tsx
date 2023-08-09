import { TransactionApiOut } from "app/services/api";
import { useEffect, useState } from "react";
import { useTransactionsQuery } from "../hooks";
import Bar from "./Bar";
import FlexColumn from "components/FlexColumn";
import Form from "./Form";
import { useInfiniteQuery } from "hooks/useInfiniteQuery";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { useNavigate } from "react-router-dom";
import { TransactionCard } from "./TransactionCard";
import { Card } from "semantic-ui-react";

export default function TransactionCards(props: {
  onMutation?: (x: TransactionApiOut) => void;
  onFlowCheckboxChange?: (
    flow: TransactionApiOut,
    checked: boolean
  ) => Promise<void>;
  checked?: number[];
  accountId?: number;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [selectedTransaction, setSelectedTransaction] = useState<
    TransactionApiOut | undefined
  >(undefined);

  const [selectedAccountId, setSelectedAccountId] = useState(0);
  const [accountId, setAccountId] = useState(props.accountId || 0);
  const [search, setSearch] = useState("");
  const [timestamp, setTimestamp] = useState<Date | undefined>(undefined);
  const [isDescending, setIsDescending] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (props.accountId) setAccountId(props.accountId);
  }, [props.accountId]);

  function handleGoToMovement(transaction: TransactionApiOut) {
    let params = new URLSearchParams();
    params.append("isFormOpen", "true");
    params.append("movementId", transaction.movement_id.toString());
    navigate(`/movements/?${params.toString()}`);
  }

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
    <FlexColumn>
      {selectedTransaction && (
        <Form.Edit
          open={isFormOpen}
          onClose={handleCloseForm}
          accountId={selectedAccountId}
          movementId={selectedTransaction.movement_id}
          transaction={selectedTransaction}
          onEdited={infiniteQuery.mutate}
        />
      )}
      <Bar
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
        <Card.Group style={{ margin: 0 }}>
          {Object.values(infiniteQuery.pages).map((transactionPage, i) =>
            transactionPage.map((t, j) => {
              if (props.onFlowCheckboxChange) {
                const checked = props.checked?.includes(t.id);
                return (
                  <TransactionCard
                    key={i * 20 + j}
                    transaction={t}
                    onOpenEditForm={() => handleOpenEditForm(t)}
                    onCheckboxChange={
                      props.onFlowCheckboxChange &&
                      (async (c) => await props.onFlowCheckboxChange!(t, c))
                    }
                    checkBoxDisabled={checked && props.checked?.length === 1}
                    checked={checked}
                  />
                );
              } else {
                return (
                  <TransactionCard
                    key={i * 20 + j}
                    transaction={t}
                    onGoMovement={() => handleGoToMovement(t)}
                    onOpenEditForm={() => handleOpenEditForm(t)}
                  />
                );
              }
            })
          )}
        </Card.Group>
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
