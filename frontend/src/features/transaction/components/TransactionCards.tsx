import {
  ReadManyApiUsersMeAccountsAccountIdTransactionsGetApiArg,
  ReadManyApiUsersMeTransactionsGetApiArg,
  TransactionApiOut,
  api,
} from "app/services/api";
import { useEffect, useState } from "react";
import Bar from "./Bar";
import FlexColumn from "components/FlexColumn";
import Form from "./Form";
import { useInfiniteQuery } from "hooks/useInfiniteQuery";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { useNavigate } from "react-router-dom";
import { TransactionCard } from "./TransactionCard";
import { Card } from "semantic-ui-react";
import { formatDateParam } from "utils/time";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import ExhaustedDataCard from "components/ExhaustedDataCard";

export default function TransactionCards(props: {
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
  const [amountGe, setAmountGe] = useState<number | undefined>(undefined);
  const [amountLe, setAmountLe] = useState<number | undefined>(undefined);

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

  const queryArg: ReadManyApiUsersMeTransactionsGetApiArg = {
    timestamp: timestamp && formatDateParam(timestamp),
    search,
    isDescending,
    amountGe,
    amountLe,
  };

  const transactionsQuery = useInfiniteQuery(
    api.endpoints.readManyApiUsersMeTransactionsGet,
    accountId ? skipToken : queryArg,
    20
  );

  const filteredQueryArg: ReadManyApiUsersMeAccountsAccountIdTransactionsGetApiArg =
    {
      timestamp: timestamp && formatDateParam(timestamp),
      accountId: accountId,
      search,
      isDescending,
      amountGe,
      amountLe,
    };

  const accountTransactionsQuery = useInfiniteQuery(
    api.endpoints.readManyApiUsersMeAccountsAccountIdTransactionsGet,
    accountId ? filteredQueryArg : skipToken,
    20
  );

  const infiniteQuery = accountId
    ? accountTransactionsQuery
    : transactionsQuery;

  return (
    <FlexColumn style={{ height: "100%" }}>
      {selectedTransaction && (
        <Form.Edit
          open={isFormOpen}
          onClose={handleCloseForm}
          accountId={selectedAccountId}
          movementId={selectedTransaction.movement_id}
          transaction={selectedTransaction}
          onEdited={infiniteQuery.onMutation}
        />
      )}
      <Bar
        accountId={accountId}
        onAccountIdChange={setAccountId}
        search={search}
        onSearchChange={setSearch}
        timestamp={timestamp}
        onTimestampChange={setTimestamp}
        isDescending={isDescending}
        onToggleIsDescending={() => setIsDescending((x) => !x)}
        amountGe={amountGe}
        onAmountGeChange={setAmountGe}
        amountLe={amountLe}
        onAmountLeChange={setAmountLe}
      />
      <FlexColumn.Auto reference={infiniteQuery.reference}>
        {infiniteQuery.isError && <QueryErrorMessage query={infiniteQuery} />}
        <Card.Group style={{ margin: 0 }}>
          {infiniteQuery.data.map((t, i) => {
            if (props.onFlowCheckboxChange) {
              const checked = props.checked?.includes(t.id);
              return (
                <TransactionCard
                  key={i}
                  transaction={t}
                  onOpenEditForm={() => handleOpenEditForm(t)}
                  onCheckboxChange={
                    props.onFlowCheckboxChange &&
                    (async (c) => {
                      await props.onFlowCheckboxChange!(t, c);
                      infiniteQuery.onMutation();
                    })
                  }
                  checkBoxDisabled={checked && props.checked?.length === 1}
                  checked={checked}
                />
              );
            } else {
              return (
                <TransactionCard
                  key={i}
                  transaction={t}
                  onGoMovement={() => handleGoToMovement(t)}
                  onOpenEditForm={() => handleOpenEditForm(t)}
                />
              );
            }
          })}
          {infiniteQuery.isFetching && (
            <TransactionCard.Placeholder onOpenEditForm />
          )}
          {infiniteQuery.isExhausted && <ExhaustedDataCard />}
        </Card.Group>
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
