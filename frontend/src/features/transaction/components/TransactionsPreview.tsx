import { TransactionApiIn } from "app/services/api";
import { TransactionCard } from "./TransactionCard";

export default function TransactionsPreview(props: {
  transactionPages: TransactionApiIn[][];
}) {
  return (
    <div style={{ padding: 1 }}>
      {props.transactionPages.map((transactionPage, i) =>
        transactionPage.map((transaction, j) => (
          <TransactionCard key={i * 20 + j} transaction={transaction} />
        ))
      )}
    </div>
  );
}
