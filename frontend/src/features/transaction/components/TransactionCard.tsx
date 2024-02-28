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
  MovementApiOut,
  TransactionApiIn,
  TransactionApiOut,
  api,
} from "app/services/api";
import ActionButton from "components/ActionButton";
import CurrencyLabel from "components/CurrencyLabel";
import FlexRow from "components/FlexRow";
import FormattedTimestamp from "components/FormattedTimestamp";
import LineWithHiddenOverflow from "components/LineWithHiddenOverflow";
import AccountIcon from "features/account/components/Icon";
import MovementForm from "features/movements/components/Form";
import { ReactNode, useState } from "react";
import { Card, Checkbox, Header, Popup } from "semantic-ui-react";
import { useUploadTransactionFile } from "../hooks/useUploadTransactionFile";
import TransactionForm from "./Form";
import ModalFileViewer from "./ModalFileViewer";
import { CategoryIcon } from "features/categories/components/CategoryIcon";
import { Flows } from "features/movements/components/Flows";
import { skipToken } from "@reduxjs/toolkit/dist/query";

export function TransactionCard(props: {
  timestamp?: string;
  categoryId?: number;
  name?: string;
  amount?: number;
  accountBalance?: number;
  checked?: boolean;
  onCheckedChange?: (x: boolean) => void;
  checkBoxDisabled?: boolean;
  loading?: boolean;
  accountId?: number;
  onFileDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  buttons?: ReactNode;
  children?: ReactNode;
}) {
  const accountQuery = api.endpoints.readUsersMeAccountsAccountIdGet.useQuery(
    props.accountId || skipToken,
  );

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
          <Card.Meta>
            <FormattedTimestamp
              timestamp={props.timestamp}
              loading={props.loading}
              style={{ width: "9em" }}
            />
          </Card.Meta>
          {props.accountId && (
            <AccountIcon
              account={accountQuery.data}
              loading={props.loading || accountQuery.isLoading}
              style={{
                height: "90%",
                width: "2.2em",
                alignSelf: "center",
              }}
            />
          )}
          {props.accountId && (
            <LineWithHiddenOverflow
              content={accountQuery.data?.name}
              style={{ width: "8em" }}
              loading={props.loading || accountQuery.isLoading}
            />
          )}
          {props.categoryId && <CategoryIcon categoryId={props.categoryId} />}
          <FlexRow.Auto>
            <Header as="h5">
              <LineWithHiddenOverflow
                content={props.name}
                loading={props.loading}
              />
            </Header>
          </FlexRow.Auto>
          {props.buttons}
        </FlexRow>
        {props.children}
      </Card.Content>
      <Card.Content extra>
        <FlexRow justifyContent="right" gap="1ch" alignItems="baseline">
          <div style={{ color: "black", fontWeight: "bold" }}>Total:</div>
          <Popup
            disabled={!props.accountBalance || !accountQuery.data}
            position="left center"
            content={
              <p>
                {`Account balance: ${Number(
                  props.accountBalance,
                ).toLocaleString(undefined, {
                  style: "currency",
                  currency: accountQuery.data?.currency_code,
                })}`}
              </p>
            }
            trigger={
              <div>
                <CurrencyLabel
                  amount={props.amount}
                  currencyCode={accountQuery.data?.currency_code}
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
      amount={Number(props.transaction?.amount)}
      categoryId={props.transaction?.category_id || undefined}
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
}) {
  const uploadTransactionFile = useUploadTransactionFile(
    (!props.transaction?.consolidated && props.transaction) || undefined,
  );

  async function handleFileDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    await uploadTransactionFile.onUpload(file);
  }

  const [movementOpen, setMovementOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [fileOpen, setFileOpen] = useState(false);

  return (
    <TransactionCard
      accountId={props.transaction?.account_id}
      checkBoxDisabled={props.checkBoxDisabled}
      checked={props.checked}
      onFileDrop={handleFileDrop}
      loading={props.loading}
      accountBalance={Number(props.transaction?.account_balance)}
      amount={Number(props.transaction?.amount)}
      categoryId={props.transaction?.category_id || undefined}
      name={props.transaction?.name}
      timestamp={props.transaction?.timestamp}
      onCheckedChange={props.onCheckedChange}
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

            {/* See movement button and form */}

            {props.transaction.movement_id && (
              <>
                <ActionButton
                  tooltip="See Movement"
                  icon="arrows alternate horizontal"
                  onClick={() => setMovementOpen(true)}
                  disabled={props.loading}
                />
                {movementOpen && (
                  <MovementForm
                    onClose={() => setMovementOpen(false)}
                    movementId={props.transaction.movement_id}
                  />
                )}
              </>
            )}

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
  transaction: MovementApiOut;
  checked?: boolean;
  onCheckedChange?: (x: boolean) => void;
  checkBoxDisabled?: boolean;
  loading?: boolean;
}) {
  return (
    <TransactionCard
      accountId={props.transaction.account_id || undefined}
      checkBoxDisabled={props.checkBoxDisabled}
      checked={props.checked}
      loading={props.loading}
      onCheckedChange={props.onCheckedChange}
      amount={Number(props.transaction.amount_default_currency)}
      timestamp={props.transaction.timestamp}
      name={props.transaction.name}
      categoryId={props.transaction.category_id || undefined}
    >
      <Flows loading={props.loading} movementId={props.transaction.id} />
    </TransactionCard>
  );
}

TransactionCard.Preview = TransactionCardPreview;
TransactionCard.Simple = TransactionCardSimple;
TransactionCard.Group = TransactionCardGroup;
