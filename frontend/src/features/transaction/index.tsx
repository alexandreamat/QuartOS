import { useState } from "react";

import TransactionForm from "./Form";
import { TransactionApiOut } from "app/services/api";

import ManagedTable from "./ManagedTable";

export default function Transactions() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    TransactionApiOut | undefined
  >(undefined);
  const [selectedAccountId, setSelectedAccountId] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const handleOpenCreateForm = (accountId: number) => {
    setSelectedAccountId(accountId);
    setSelectedTransaction(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (transaction: TransactionApiOut) => {
    setSelectedAccountId(0);
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedAccountId(0);
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
        onMutation={handleMutation}
      />
    </div>
  );
}
