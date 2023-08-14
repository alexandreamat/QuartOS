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
      movement={props.movement}
      onOpenEditForm={props.onOpenEditForm}
      explanationRate={props.explanationRate}
    />
  );
}

function MovementUnifiedCardPlaceholder(props: {
  onOpenEditForm?: boolean;
  onOpenCreateTransactionForm?: boolean;
  onOpenEditTransactionForm?: boolean;
  onRemoveTransaction?: boolean;
  explanationRate?: boolean;
}) {
  return (
    <>
      <TransactionCard.Placeholder
        onOpenEditForm={props.onOpenEditForm}
        explanationRate={props.explanationRate}
      />
      <MovementCard.Placeholder
        onOpenEditForm={props.onOpenEditForm}
        explanationRate={props.explanationRate}
      />
    </>
  );
}

MovementUnifiedCard.Placeholder = MovementUnifiedCardPlaceholder;
