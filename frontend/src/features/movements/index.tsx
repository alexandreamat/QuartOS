import { MovementApiOut, api } from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { Bar } from "./components/Bar";
import { MovementCard } from "./components/MovementCard";
import Form from "./components/Form";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "hooks/useInfiniteQuery";
import { TransactionCard } from "features/transaction/components/TransactionCard";
import { formatDateParam } from "utils/time";

export default function Movements() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
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

  const handleSearchChange = (value: string) => {
    infiniteQuery.reset();
    setSearch(value);
  };

  function handleStartDateChange(value: Date | undefined) {
    infiniteQuery.reset();
    setStartDate(value);
  }

  function handleEndDateChange(value: Date | undefined) {
    infiniteQuery.reset();
    setEndDate(value);
  }

  function handleToggleIsDescending() {
    infiniteQuery.reset();
    setIsDescending((prev) => !prev);
  }

  const infiniteQuery = useInfiniteQuery(
    api.endpoints.readManyApiMovementsGet.useQuery,
    {
      search,
      isDescending,
      startDate: startDate && formatDateParam(startDate),
      endDate: endDate && formatDateParam(endDate),
    },
    10,
    () => {}
  );

  return (
    <>
      <FlexColumn>
        <Bar
          onOpenCreateForm={handleOpenCreateForm}
          search={search}
          onSearchChange={handleSearchChange}
          startDate={startDate}
          onStartDateChange={handleStartDateChange}
          endDate={endDate}
          onEndDateChange={handleEndDateChange}
          isDescending={isDescending}
          onToggleIsDescending={handleToggleIsDescending}
        />
        <FlexColumn.Auto
          style={{ padding: 1 }}
          reference={infiniteQuery.reference}
        >
          <>
            {infiniteQuery.isError && (
              <QueryErrorMessage query={infiniteQuery} />
            )}
            {Object.values(infiniteQuery.pages).map((movements) =>
              movements.map((movement) =>
                movement.transactions.length === 1 ? (
                  <TransactionCard
                    transaction={movement.transactions[0]}
                    onOpenEditForm={() => handleOpenEditForm(movement)}
                  />
                ) : (
                  <MovementCard
                    key={movement.id}
                    movement={movement}
                    onOpenEditForm={() => handleOpenEditForm(movement)}
                  />
                )
              )
            )}
          </>
        </FlexColumn.Auto>
      </FlexColumn>
      <Form
        open={isFormOpen}
        onClose={handleCloseForm}
        movementId={movementId}
      />
    </>
  );
}
