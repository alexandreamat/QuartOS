import { api } from "app/services/api";
import { Button, Image } from "semantic-ui-react";

export function CategoryIcon(props: { categoryId: number }) {
  const query = api.endpoints.readCategoriesCategoryIdGet.useQuery(
    props.categoryId,
  );

  if (query.isLoading) return <Button circular loading disabled />;
  if (query.isError || query.isUninitialized) return <></>;

  return (
    <Image
      style={{ height: "90%", width: "auto", alignSelf: "center" }}
      src={`data:image/png;base64,${query.data.icon_base64}`}
    />
  );
}
