import { useState } from "react";

import TransactionForm from "./components/Form";
import { TransactionApiOut } from "app/services/api";

import ManagedTable from "./components/ManagedTable";

export default function Transactions() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    TransactionApiOut | undefined
  >(undefined);
  const [selectedAccountId, setSelectedAccountId] = useState(0);
  const [selectedRelatedTransactionId, setSelectedRelatedTransactionId] =
    useState(0);
  const [resetKey, setResetKey] = useState(0);
  const handleOpenCreateForm = (
    accountId: number,
    relatedTransactionId: number
  ) => {
    setSelectedAccountId(accountId);
    setSelectedTransaction(undefined);
    setSelectedRelatedTransactionId(relatedTransactionId);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (transaction: TransactionApiOut) => {
    setSelectedAccountId(0);
    setSelectedRelatedTransactionId(0);
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedAccountId(0);
    setSelectedRelatedTransactionId(0);
    setSelectedTransaction(undefined);
    setIsFormOpen(false);
  };

  const handleMutation = () => setResetKey((x) => x + 1);

  return (
    <div style={{ height: "100%" }}>
      <ManagedTable
        onOpenCreateForm={handleOpenCreateForm}
        onOpenEditForm={handleOpenEditForm}
        resetKey={resetKey}
      />
      <TransactionForm
        transaction={selectedTransaction}
        open={isFormOpen}
        onClose={handleCloseForm}
        accountId={selectedAccountId}
        relatedTransactionId={selectedRelatedTransactionId}
        onMutation={handleMutation}
      />
    </div>
  );
}
