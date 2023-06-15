import { useState } from "react";

import Form from "./components/Form";
import { TransactionApiOut } from "app/services/api";

import ManagedTable from "./components/ManagedTable";

export default function Transactions() {
  return (
    <div style={{ height: "100%" }}>
      <ManagedTable />
    </div>
  );
}
