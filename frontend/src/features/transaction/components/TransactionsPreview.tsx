import { TransactionApiIn } from "app/services/api";
import { TransactionCard } from "./TransactionCard";
import { Card } from "semantic-ui-react";

export default function TransactionsPreview(props: {
  accountId: number;
  transactionPages: TransactionApiIn[][];
}) {
  return (
    <Card.Group>
      {props.transactionPages.map((transactionPage, i) =>
        transactionPage.map((transaction, j) => (
          <TransactionCard
            key={i * 20 + j}
            transaction={transaction}
            accountId={props.accountId}
          />
        ))
      )}
    </Card.Group>
  );
}
