// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { api } from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { useCheckboxes } from "hooks/useCheckboxes";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { logMutationError } from "utils/error";
import Bar, { useTransactionBarState } from "./components/Bar";
import SpanButton from "./components/SpanButton";
import TransactionCards from "./components/TransactionCards";

export const PER_PAGE = 20;

export default function Transactions() {
  const location = useLocation();

  const reference = useRef<HTMLDivElement | null>(null);

  const isMultipleChoiceState = useState(false);
  const [isMultipleChoice, setIsMultipleChoice] = isMultipleChoiceState;

  const barState = useTransactionBarState();
  const [_, setAccountId] = barState.accountId;

  const checkboxes = useCheckboxes();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accountIdParam = Number(params.get("accountId")) || undefined;
    if (accountIdParam) setAccountId(accountIdParam);
  }, [location, setAccountId]);

  const [consolidateTransactions, consolidateTransactionsResult] =
    api.endpoints.consolidateUsersMeTransactionsPost.useMutation();

  async function handleConsolidateTransactions() {
    try {
      await consolidateTransactions([...checkboxes.checked]).unwrap();
    } catch (error) {
      logMutationError(error, consolidateTransactionsResult);
      return;
    }
    setIsMultipleChoice(false);
    checkboxes.reset();
  }

  return (
    <FlexColumn style={{ height: "100%" }}>
      <Bar barState={barState} isMultipleChoiceState={isMultipleChoiceState} />
      <FlexColumn.Auto reference={reference}>
        <TransactionCards
          barState={barState}
          checkboxes={checkboxes}
          isMultipleChoice={isMultipleChoice}
          reference={reference}
        />
      </FlexColumn.Auto>
      {isMultipleChoice && (
        <SpanButton
          disabled={checkboxes.checked.size <= 1}
          onClick={handleConsolidateTransactions}
          loading={consolidateTransactionsResult.isLoading}
          negative={consolidateTransactionsResult.isError}
        >
          {`Consolidate ${checkboxes.checked.size} transactions into one group`}
        </SpanButton>
      )}
    </FlexColumn>
  );
}
