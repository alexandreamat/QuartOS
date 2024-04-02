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

import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Doughnut } from "react-chartjs-2";
import {
  AggregateBy,
  CategoryApiOut,
  TransactionGroupApiOut,
  api,
} from "app/services/api";
import FlexColumn from "components/FlexColumn";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Grid, Header, Loader } from "semantic-ui-react";
import PLCard from "./PLCard";
import PLTransactions from "./PLTransactions";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  Colors,
} from "chart.js";
import { CategoryIcon } from "features/categories/components/CategoryIcon";
import FlexRow from "components/FlexRow";
import TransactionForm from "features/transaction/components/Form";

Chart.register(Colors, ArcElement, Tooltip, Legend);

export default function PLStatement(props: {
  aggregateBy: AggregateBy;
  bucketId?: number;
}) {
  const { timestampGe, timestampLt } = useParams();
  const { aggregateBy, bucketId } = props;

  const [showIncome, setShowIncome] = useState(true);
  const [transactionGroup, setTransactionGroup] =
    useState<TransactionGroupApiOut>();
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState<number>();

  const detailedStatementQuery =
    api.endpoints.getDetailedPlStatementUsersMeAnalyticsDetailedTimestampGeTimestampLtGet.useQuery(
      timestampGe && timestampLt
        ? { timestampGe, timestampLt, bucketId }
        : skipToken,
    );

  const categoriesQuery = api.endpoints.readManyCategoriesGet.useQuery();

  function handleClickIncome() {
    setSelectedCategoryIdx(undefined);
    setShowIncome(true);
  }

  function handleClickExpenses() {
    setSelectedCategoryIdx(undefined);
    setShowIncome(false);
  }

  if (
    detailedStatementQuery.isLoading ||
    detailedStatementQuery.isUninitialized ||
    categoriesQuery.isLoading ||
    categoriesQuery.isUninitialized
  )
    return <Loader active size="huge" />;

  if (detailedStatementQuery.isError || categoriesQuery.isError)
    return <QueryErrorMessage query={detailedStatementQuery} />;

  const categoryNamesById = Object.fromEntries(
    categoriesQuery.data.map((c) => [c.id, c.name]),
  );

  const categoriesById = categoriesQuery.data.reduce(
    (acc, cat) => ({ ...acc, [cat.id]: cat }),
    {} as { [id: number]: CategoryApiOut },
  );

  const amountByCategoryRaw = showIncome
    ? detailedStatementQuery.data.income_by_category
    : detailedStatementQuery.data.expenses_by_category;

  const doughnutEntries = Object.entries(amountByCategoryRaw)
    .map(([categoryIdStr, amount]) => ({
      id: Number(categoryIdStr),
      amount: amount,
    }))
    .map(({ id, amount }) => ({
      id,
      name: id === 0 ? "Uncategorised" : categoryNamesById[id],
      amount,
    }))
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

  const doughnutData: ChartData<"doughnut"> = {
    datasets: [
      {
        data: doughnutEntries.map((o) => o.amount),
        label: "Amount",
      },
    ],
    labels: doughnutEntries.map((o) => o.name),
  };

  const selectedCategoryId =
    selectedCategoryIdx !== undefined
      ? doughnutEntries[selectedCategoryIdx].id
      : undefined;

  const selectedCategory =
    selectedCategoryId !== undefined
      ? categoriesById[selectedCategoryId]
      : undefined;

  return (
    <FlexColumn>
      {transactionGroup && (
        <TransactionForm.Edit.Group
          onClose={() => setTransactionGroup(undefined)}
          transaction={transactionGroup}
        />
      )}
      <FlexColumn.Auto>
        <PLCard
          detailedPlStatement={detailedStatementQuery.data}
          showIncome={showIncome}
          onClickIncome={handleClickIncome}
          onClickExpenses={handleClickExpenses}
          aggregateBy={aggregateBy}
        />
        <Grid columns={2} stackable>
          <Grid.Column>
            <Doughnut
              data={doughnutData}
              options={{
                onClick: (e, elements, c) =>
                  setSelectedCategoryIdx(elements[0]?.index),
                plugins: {
                  colors: {
                    forceOverride: true,
                  },
                },
              }}
            />
          </Grid.Column>
          <Grid.Column>
            {selectedCategoryId !== undefined && (
              <FlexRow
                alignItems="center"
                gap="1ch"
                style={{ height: "2.2em" }}
              >
                {selectedCategory && (
                  <CategoryIcon categoryId={selectedCategory.id} />
                )}
                <FlexRow.Auto>
                  <Header as={"h3"}>
                    {selectedCategory?.name || "Uncategorised"}
                  </Header>
                </FlexRow.Auto>
              </FlexRow>
            )}
            <PLTransactions
              plStatement={detailedStatementQuery.data}
              showIncome={showIncome}
              onOpenEditForm={setTransactionGroup}
              categoryId={selectedCategoryId}
            />
          </Grid.Column>
        </Grid>
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
