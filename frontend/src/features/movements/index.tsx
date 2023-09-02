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
import { MovementCard } from "./components/MovementCard";
import ExhaustedDataCard from "components/ExhaustedDataCard";

const PER_PAGE = 10;
const NOT_FOUND = -1;

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

  const movementIdx = infiniteQuery.data.findIndex((m) => m.id === movementId);

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

  function handleOpenEditForm(id: number) {
    setMovementId(id);
    setIsFormOpen(true);
  }

  function handleGoToRelativeMovement(x: number) {
    setMovementId(infiniteQuery.data[movementIdx + x]?.id || 0);
  }

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setMovementId(0);
  };

  return (
    <FlexColumn>
      <Form
        open={isFormOpen}
        onClose={handleCloseForm}
        movementId={movementId}
        onMutate={infiniteQuery.onMutation}
        onGoToPrev={
          movementIdx !== NOT_FOUND && movementIdx > 0
            ? () => handleGoToRelativeMovement(-1)
            : undefined
        }
        onGoToNext={
          movementIdx !== NOT_FOUND &&
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
          {infiniteQuery.data.map((m) => (
            <MovementCard
              key={m.id}
              movement={m}
              onOpenEditForm={() => handleOpenEditForm(m.id)}
              selectedAccountId={accountId}
              showFlows={m.transactions.length > 1}
            />
          ))}
          {infiniteQuery.isFetching && (
            <MovementCard.Placeholder key="placeholder" onOpenEditForm />
          )}
          {infiniteQuery.isExhausted && <ExhaustedDataCard />}
        </Card.Group>
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
