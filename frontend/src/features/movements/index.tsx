import { api } from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { Loader } from "semantic-ui-react";
import { Bar } from "./components/Bar";
import { Movement } from "./components/Movement";
import Form from "./components/Form";
import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function Movements() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isFormOpenParam = params.get("isFormOpen") === "true";

  const [isFormOpen, setIsFormOpen] = useState(isFormOpenParam);

  const movementsQuery = api.endpoints.readManyApiMovementsGet.useQuery({});

  const handleOpenCreateForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  if (movementsQuery.isLoading) return <Loader active size="huge" />;

  if (movementsQuery.isError)
    return <QueryErrorMessage query={movementsQuery} />;

  return (
    <>
      <FlexColumn>
        <Bar onOpenCreateForm={handleOpenCreateForm} />
        <FlexColumn.Auto style={{ padding: 1 }}>
          {movementsQuery.isSuccess &&
            movementsQuery.data.map((movement) => (
              <Movement key={movement.id} movement={movement} />
            ))}
        </FlexColumn.Auto>
      </FlexColumn>
      <Form onClose={handleCloseForm} open={isFormOpen} />
    </>
  );
}
