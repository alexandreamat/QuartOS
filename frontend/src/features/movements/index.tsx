import { MovementApiOut, api } from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { Bar } from "./components/Bar";
import { Movement } from "./components/Movement";
import Form from "./components/Form";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "hooks/useInfiniteQuery";
import { skipToken } from "@reduxjs/toolkit/dist/query";

export default function Movements() {
  const location = useLocation();
  const navigate = useNavigate();

  const [formMode, setFormMode] = useState<"create" | "edit" | undefined>(
    undefined
  );
  const [search, setSearch] = useState("");
  const [selectedMovement, setSelectedMovement] = useState<
    MovementApiOut | undefined
  >(undefined);
  const [movementId, setMovementId] = useState(0);

  const movementQuery = api.endpoints.readApiMovementsIdGet.useQuery(
    movementId || skipToken
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const formModeParam = params.get("formMode");
    if (formModeParam !== "create" && formModeParam !== "edit") return;
    setFormMode(formModeParam);
    params.delete("formMode");

    if (formModeParam === "edit") {
      setMovementId(Number(params.get("movementId")));
      params.delete("movementId");
    }

    navigate({ ...location, search: params.toString() }, { replace: true });
  }, [location, navigate]);

  useEffect(() => {
    if (movementQuery.isSuccess) setSelectedMovement(movementQuery.data);
  }, [movementQuery.isSuccess, movementQuery.data]);

  const handleOpenCreateForm = () => {
    setSelectedMovement(undefined);
    setFormMode("create");
  };

  function handleOpenEditForm(movement: MovementApiOut) {
    setSelectedMovement(movement);
    setFormMode("edit");
  }

  const handleCloseForm = () => {
    setSelectedMovement(undefined);
    setFormMode(undefined);
  };

  const handleSearchChange = (value: string) => {
    infiniteQuery.reset();
    setSearch(value);
  };

  const infiniteQuery = useInfiniteQuery(
    api.endpoints.readManyApiMovementsGet.useQuery,
    { search },
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
              movements.map((movement) => (
                <Movement
                  key={movement.id}
                  movement={movement}
                  onOpenEditForm={() => handleOpenEditForm(movement)}
                />
              ))
            )}
          </>
        </FlexColumn.Auto>
      </FlexColumn>

      {formMode === "create" && <Form.Create onClose={handleCloseForm} />}
      {selectedMovement && formMode === "edit" && (
        <Form.Edit onClose={handleCloseForm} movement={selectedMovement} />
      )}
    </>
  );
}
