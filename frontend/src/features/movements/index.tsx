import { api } from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { Bar } from "./components/Bar";
import Form from "./components/Form";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "hooks/useInfiniteQuery";
import { formatDateParam } from "utils/time";
import { Card, Message } from "semantic-ui-react";
import MovementUnifiedCard from "./components/MovementUnifiedCard";
import { TransactionCard } from "features/transaction/components/TransactionCard";

const PER_PAGE = 10;

export default function Movements() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [accountId, setAccountId] = useState(0);
  const [isDescending, setIsDescending] = useState(true);

  const [movementId, setMovementId] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const isFormOpenParam = params.get("isFormOpen");
    if (isFormOpenParam) {
      setIsFormOpen(isFormOpenParam === "true");
      params.delete("isFormOpen");
      navigate({ ...location, search: params.toString() }, { replace: true });
    }

    const movementIdParam = params.get("movementId");
    if (movementIdParam) {
      setMovementId(Number(movementIdParam));
      params.delete("movementId");
      navigate({ ...location, search: params.toString() }, { replace: true });
    }

    const accountIdParam = Number(params.get("accountId"));
    if (accountIdParam) {
      setAccountId(Number(accountIdParam));
      params.delete("accountId");
      navigate({ ...location, search: params.toString() }, { replace: true });
    }
  }, [location, navigate]);

  const handleOpenCreateForm = () => {
    setMovementId(0);
    setIsFormOpen(true);
  };

  function handleOpenEditForm(movement: MovementApiOut) {
    setMovementId(movement.id);
    setIsFormOpen(true);
  }

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setMovementId(0);
  };

  const infiniteQuery = useInfiniteQuery(
    api.endpoints.readManyApiUsersMeMovementsGet.useLazyQuery,
    {
      search: search.length ? search : undefined,
      isDescending,
      startDate: startDate && formatDateParam(startDate),
      endDate: endDate && formatDateParam(endDate),
      accountId: accountId ? accountId : undefined,
    },
    PER_PAGE
  );

  return (
    <FlexColumn>
      <Form
        open={isFormOpen}
        onClose={handleCloseForm}
        movementId={movementId}
        onMutate={infiniteQuery.mutate}
      />
      <Bar
        onOpenCreateForm={handleOpenCreateForm}
        search={search}
        onSearchChange={setSearch}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        accountId={accountId}
        onAccountIdChange={setAccountId}
        isDescending={isDescending}
        onToggleIsDescending={() => setIsDescending((x) => !x)}
      />
      <FlexColumn.Auto reference={infiniteQuery.reference}>
        <Card.Group style={{ margin: 0 }}>
          {infiniteQuery.isError && <QueryErrorMessage query={infiniteQuery} />}
          {Object.values(infiniteQuery.pages).map((movements) =>
            movements.map((movement) => (
              <MovementUnifiedCard
                key={movement.id}
                movement={movement}
                onOpenEditForm={() => handleOpenEditForm(movement)}
                selectedAccountId={accountId}
              />
            ))
          )}
          {infiniteQuery.isFetching && (
            <TransactionCard.Placeholder key="placeholder" onOpenEditForm />
          )}
        </Card.Group>
        {infiniteQuery.isExhausted && (
          <Message
            content="There is no more data available."
            style={{ textAlign: "center" }}
          />
        )}
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
