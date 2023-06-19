import { api } from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { Loader, Message } from "semantic-ui-react";
import { Bar } from "./components/Bar";
import { Movement } from "./components/Movement";
import Form from "./components/Form";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useInfiniteQuery } from "hooks/useInfiniteQuery";

export default function Movements() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isFormOpenParam = params.get("isFormOpen") === "true";

  const [isFormOpen, setIsFormOpen] = useState(isFormOpenParam);
  const [search, setSearch] = useState("");

  const handleOpenCreateForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
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
                <Movement key={movement.id} movement={movement} />
              ))
            )}
          </>
        </FlexColumn.Auto>
      </FlexColumn>
      <Form onClose={handleCloseForm} open={isFormOpen} />
    </>
  );
}
