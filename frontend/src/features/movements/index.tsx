import { ReadManyApiUsersMeMovementsGetApiArg, api } from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { Bar } from "./components/Bar";
import Form from "./components/Form";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "hooks/useInfiniteQuery";
import { formatDateParam } from "utils/time";
import { Card } from "semantic-ui-react";
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
  const [movementIdx, setMovementIdx] = useState<number | undefined>(undefined);

  const infiniteQuery = useInfiniteQuery(
    api.endpoints.readManyApiUsersMeMovementsGet,
    {
      search: search.length ? search : undefined,
      isDescending,
      startDate: startDate && formatDateParam(startDate),
      endDate: endDate && formatDateParam(endDate),
      accountId: accountId ? accountId : undefined,
    } as ReadManyApiUsersMeMovementsGetApiArg,
    PER_PAGE
  );

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
      setMovementIdx(undefined);
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

  useEffect(() => {
    if (movementIdx === undefined) return;
    const movement = infiniteQuery.data[movementIdx];
    if (movement === undefined) return;
    setMovementId(movement.id);
  }, [movementIdx, infiniteQuery.data]);

  const handleOpenCreateForm = () => {
    setMovementId(0);
    setIsFormOpen(true);
  };

  function handleOpenEditForm(idx: number) {
    setMovementIdx(idx);
    setIsFormOpen(true);
  }

  function handleGoToRelativeMovement(x: number) {
    setMovementIdx((prev) => (prev === undefined ? undefined : prev + x));
  }

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setMovementId(0);
  };

  async function handleMutation(id: number) {
    await infiniteQuery.onMutation();
    Object.values(infiniteQuery.data).forEach((m, i) => {
      if (id !== m.id) return;
      setMovementIdx(i);
    });
  }

  return (
    <FlexColumn>
      <Form
        open={isFormOpen}
        onClose={handleCloseForm}
        movementId={movementId}
        onMutate={handleMutation}
        onGoToPrev={
          movementIdx !== undefined && movementIdx > 0
            ? () => handleGoToRelativeMovement(-1)
            : undefined
        }
        onGoToNext={
          movementIdx !== undefined &&
          movementIdx + 1 < infiniteQuery.data.length
            ? () => handleGoToRelativeMovement(1)
            : undefined
        }
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
          {infiniteQuery.data.map((movement, i) => (
            <MovementUnifiedCard
              key={movement.id}
              movement={movement}
              onOpenEditForm={() => handleOpenEditForm(i)}
              selectedAccountId={accountId}
            />
          ))}
          {infiniteQuery.isFetching && (
            <TransactionCard.Placeholder key="placeholder" onOpenEditForm />
          )}
          {infiniteQuery.isExhausted && (
            <Card fluid>
              <Card.Content textAlign="center">
                <Card.Meta>There is no more data available.</Card.Meta>
              </Card.Content>
            </Card>
          )}
        </Card.Group>
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
