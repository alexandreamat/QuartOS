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

import {
  TransactionGroupApiOut,
  TransactionApiIn,
  TransactionApiOut,
  api,
} from "app/services/api";
import ActionButton from "components/ActionButton";
import CurrencyLabel from "components/CurrencyLabel";
import FlexRow from "components/FlexRow";
import LineWithHiddenOverflow from "components/LineWithHiddenOverflow";
import AccountIcon from "features/account/components/Icon";
import { ReactNode, useState } from "react";
import { Card, Checkbox, Header, Label, Popup } from "semantic-ui-react";
import { useUploadTransactionFile } from "../hooks/useUploadTransactionFile";
import TransactionForm from "./Form";
import ModalFileViewer from "./ModalFileViewer";
import { CategoryIcon } from "features/categories/components/CategoryIcon";
import { Flows } from "features/transaction/components/Flows";
import { skipToken } from "@reduxjs/toolkit/dist/query";

export function TransactionCard(props: {
  timestamp?: Date;
  categoryId?: number;
  name?: string;
  amount?: number;
  accountBalance?: number;
  checked?: boolean;
  onCheckedChange?: (x: boolean) => void;
  checkBoxDisabled?: boolean;
  loading?: boolean;
  accountId?: number;
  bucketId?: number;
  onFileDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  buttons?: ReactNode;
  children?: ReactNode;
  currency?: "default" | "account";
  explanationRate?: number;
}) {
  const accountQuery = api.endpoints.readUsersMeAccountsAccountIdGet.useQuery(
    props.accountId || skipToken,
  );
  const bucketQuery = api.endpoints.readUsersMeBucketsBucketIdGet.useQuery(
    props.bucketId || skipToken,
  );
  const me = api.endpoints.readMeUsersMeGet.useQuery();

  const currencyCode =
    props.currency === "default"
      ? me.data?.default_currency_code
      : accountQuery.data?.currency_code;

  return (
    <Card
      fluid
      color="teal"
      onDrop={props.onFileDrop}
      onDragOver={(e: DragEvent) => e.preventDefault()}
    >
      <Card.Content>
        <FlexRow gap="1ch" alignItems="baseline" style={{ height: "2.2em" }}>
          {props.onCheckedChange && (
            <Checkbox
              disabled={props.checkBoxDisabled}
              checked={props.checked}
              onChange={(_, d) =>
                props.onCheckedChange &&
                props.onCheckedChange(d.checked || false)
              }
            />
          )}

          <FlexRow.Auto>
            <Header as="h5">
              <LineWithHiddenOverflow
                content={props.name}
                loading={props.loading}
              />
            </Header>
          </FlexRow.Auto>
          {props.categoryId && <CategoryIcon categoryId={props.categoryId} />}
          {props.buttons}
        </FlexRow>
        {props.explanationRate !== undefined && (
          <Card.Meta>
            Cumulative: {`${Math.round(props.explanationRate * 100)}%`}
          </Card.Meta>
        )}
        {props.children}
      </Card.Content>
      <Card.Content extra>
        <FlexRow gap="0.5ch" alignItems="center" style={{ height: "2.2em" }}>
          {props.accountId && (
            <AccountIcon
              account={accountQuery.data}
              loading={props.loading || accountQuery.isLoading}
              style={{ height: "2em" }}
            />
          )}
          {accountQuery.data && (
            <div>
              <LineWithHiddenOverflow content={accountQuery.data.name} />
            </div>
          )}
          {bucketQuery.data && <div>/</div>}
          <FlexRow.Auto>
            {bucketQuery.data && (
              <LineWithHiddenOverflow content={bucketQuery.data.name} />
            )}
          </FlexRow.Auto>
          <div style={{ color: "black", fontWeight: "bold" }}>Total:</div>
          <Popup
            disabled={!props.accountBalance || !accountQuery.data}
            position="left center"
            content={
              accountQuery.data?.currency_code && (
                <p>
                  {`Account balance: ${props.accountBalance?.toLocaleString(
                    undefined,
                    {
                      style: "currency",
                      currency: accountQuery.data?.currency_code,
                    },
                  )}`}
                </p>
              )
            }
            trigger={
              <div>
                <CurrencyLabel
                  amount={props.amount}
                  currencyCode={currencyCode}
                  loading={accountQuery.isLoading || props.loading}
                />
              </div>
            }
          />
        </FlexRow>
      </Card.Content>
    </Card>
  );
}

function TransactionCardPreview(props: {
  checked: boolean;
  onCheckedChange: (x: boolean) => void;
  transaction?: TransactionApiIn;
  accountId: number;
}) {
  return (
    <TransactionCard
      accountId={props.accountId}
      checked={props.checked}
      onCheckedChange={props.onCheckedChange}
      amount={props.transaction?.amount}
      categoryId={props.transaction?.category_id}
      name={props.transaction?.name}
      timestamp={props.transaction?.timestamp}
    />
  );
}

function TransactionCardSimple(props: {
  transaction?: TransactionApiOut;
  checked?: boolean;
  onCheckedChange?: (x: boolean) => void;
  checkBoxDisabled?: boolean;
  loading?: boolean;
  currency?: "default" | "account";
  explanationRate?: number;
}) {
  const uploadTransactionFile = useUploadTransactionFile(
    (!props.transaction?.is_group && props.transaction) || undefined,
  );

  async function handleFileDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    await uploadTransactionFile.onUpload(file);
  }

  const [transactionGroupOpen, setTransactionGroupOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [fileOpen, setFileOpen] = useState(false);

  return (
    <TransactionCard
      accountId={props.transaction?.account_id}
      bucketId={props.transaction?.bucket_id}
      checkBoxDisabled={props.checkBoxDisabled}
      checked={props.checked}
      onFileDrop={handleFileDrop}
      loading={props.loading}
      accountBalance={props.transaction?.account_balance}
      amount={
        props.currency === "account"
          ? props.transaction?.amount
          : props.transaction?.amount_default_currency
      }
      currency={props.currency}
      categoryId={props.transaction?.category_id}
      name={props.transaction?.name}
      timestamp={props.transaction?.timestamp}
      onCheckedChange={props.onCheckedChange}
      explanationRate={props.explanationRate}
      buttons={
        props.transaction && (
          <>
            {/* See files button and form */}
            {fileOpen && (
              <ModalFileViewer
                transaction={props.transaction}
                onClose={() => setFileOpen(false)}
              />
            )}
            {/* {props.transaction?.files.length !== 0 && (
            <ActionButton
              tooltip="See files"
              icon="file"
              content={props.transaction?.files.length.toFixed(0)}
              loading={props.loading}
              onClick={() => setFileOpen(true)}
            />
          )} */}

            {/* See transactionGroup button and form */}

            {/* {props.transaction.transaction_group_id && (
              <>
                <ActionButton
                  tooltip="See TransactionGroup"
                  icon="arrows alternate horizontal"
                  onClick={() => setTransactionGroupOpen(true)}
                  disabled={props.loading}
                />
                {transactionGroupOpen && (
                  <TransactionForm.Edit.Group
                    onClose={() => setTransactionGroupOpen(false)}
                    transaction={props.transaction.transaction_group_id}
                  />
                )}
              </>
            )} */}

            {/* See more button and form */}
            {formOpen && (
              <TransactionForm.Edit
                onClose={() => setFormOpen(false)}
                transaction={props.transaction}
              />
            )}
            <ActionButton
              icon="ellipsis horizontal"
              onClick={() => setFormOpen(true)}
              disabled={props.loading}
            />
          </>
        )
      }
    />
  );
}

function TransactionCardGroup(props: {
  transaction: TransactionGroupApiOut;
  checked?: boolean;
  onCheckedChange?: (x: boolean) => void;
  checkBoxDisabled?: boolean;
  loading?: boolean;
  explanationRate?: number;
}) {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <TransactionCard
      accountId={props.transaction.account_id}
      checkBoxDisabled={props.checkBoxDisabled}
      checked={props.checked}
      loading={props.loading}
      onCheckedChange={props.onCheckedChange}
      amount={props.transaction.amount_default_currency}
      timestamp={props.transaction.timestamp}
      name={props.transaction.name}
      categoryId={props.transaction.category_id}
      currency="default"
      explanationRate={props.explanationRate}
      buttons={
        <>
          {formOpen && (
            <TransactionForm.Edit.Group
              onClose={() => setFormOpen(false)}
              transaction={props.transaction}
            />
          )}
          <ActionButton
            icon="ellipsis horizontal"
            onClick={() => setFormOpen(true)}
            disabled={props.loading}
          />
        </>
      }
    >
      <Flows
        loading={props.loading}
        transactionGroupId={props.transaction.id}
      />
    </TransactionCard>
  );
}

TransactionCard.Preview = TransactionCardPreview;
TransactionCard.Simple = TransactionCardSimple;
TransactionCard.Group = TransactionCardGroup;
