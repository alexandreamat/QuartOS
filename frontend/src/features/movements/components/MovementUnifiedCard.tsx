import { MovementApiOut, TransactionApiOut } from "app/services/api";
import { TransactionCard } from "features/transaction/components/TransactionCard";
import { MovementCard } from "./MovementCard";

export default function MovementUnifiedCard(props: {
  movement: MovementApiOut;
  onOpenEditForm?: () => void;
  onOpenCreateTransactionForm?: () => void;
  onOpenEditTransactionForm?: (x: TransactionApiOut) => void;
  onRemoveTransaction?: (x: TransactionApiOut) => void;
  explanationRate?: number;
}) {
  if (props.movement.transactions.length === 1)
    return (
      <TransactionCard
        transaction={props.movement.transactions[0]}
        onOpenEditForm={props.onOpenEditForm}
        explanationRate={props.explanationRate}
      />
    );

  return (
    <MovementCard
      key={props.movement.id}
      movement={props.movement}
      onOpenEditForm={props.onOpenEditForm}
      explanationRate={props.explanationRate}
    />
  );
}
