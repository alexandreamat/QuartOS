import { useLocation } from "react-router-dom";
import TransactionCards from "./components/TransactionCards";

export default function Transactions() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const accountIdParam = Number(params.get("accountId"));
  return (
    <div style={{ height: "100%" }}>
      <TransactionCards accountId={accountIdParam} />
    </div>
  );
}
