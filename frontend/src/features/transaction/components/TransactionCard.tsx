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
} from "app/services/api";
import ActionButton from "components/ActionButton";
import CurrencyLabel from "components/CurrencyLabel";
import FlexRow from "components/FlexRow";
import FormattedTimestamp from "components/FormattedTimestamp";
import LineWithHiddenOverflow from "components/LineWithHiddenOverflow";
import AccountIcon from "features/account/components/Icon";
import { useAccountQueries } from "features/account/hooks";
import MovementForm from "features/movements/components/Form";
import { ReactNode, useState } from "react";
import { Card, Checkbox, Header, Popup } from "semantic-ui-react";
import { useUploadTransactionFile } from "../hooks/useUploadTransactionFile";
import TransactionForm from "./Form";
import ModalFileViewer from "./ModalFileViewer";
import { CategoryIcon } from "features/categories/components/CategoryIcon";
import { MovementCard } from "features/movements/components/MovementCard";

export function TransactionCard(props: {
  transaction?: TransactionApiOut | TransactionApiIn;
  checked?: boolean;
  onCheckedChange?: (x: boolean) => void;
  checkBoxDisabled?: boolean;
  loading?: boolean;
  accountId?: number;
  onFileDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  children?: ReactNode;
}) {
  const accountQueries = useAccountQueries(props.accountId);
  const account = accountQueries.account;

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
              timestamp={props.transaction?.timestamp}
              loading={props.loading}
              style={{ width: "9em" }}
            />
          </Card.Meta>
          <AccountIcon
            account={account}
            loading={props.loading || accountQueries.isLoading}
            style={{
              height: "90%",
              width: "2.2em",
              alignSelf: "center",
            }}
          />
          <LineWithHiddenOverflow
            content={account?.name}
            style={{ width: "8em" }}
            loading={props.loading || accountQueries.isLoading}
          />
          {props.transaction?.category_id && (
            <CategoryIcon categoryId={props.transaction.category_id} />
          )}
          <FlexRow.Auto>
            <Header as="h5">
              <LineWithHiddenOverflow
                content={props.transaction?.name}
                loading={props.loading}
              />
            </Header>
          </FlexRow.Auto>
          {props.children}
        </FlexRow>
      </Card.Content>
      <Card.Content extra>
        <FlexRow justifyContent="right" gap="1ch" alignItems="baseline">
          <div style={{ color: "black", fontWeight: "bold" }}>Total:</div>
          <Popup
            disabled={
              !props.transaction || "account_balance"! in props.transaction
            }
            position="left center"
            content={
              props.transaction &&
              "account_balance" in props.transaction &&
              account && (
                <p>
                  {`Account balance: ${Number(
                    props.transaction.account_balance,
                  ).toLocaleString(undefined, {
                    style: "currency",
                    currency: account.currency_code,
                  })}`}
                </p>
              )
            }
            trigger={
              <div>
                <CurrencyLabel
                  amount={Number(props.transaction?.amount)}
                  currencyCode={account?.currency_code}
                  loading={accountQueries.isLoading || props.loading}
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
      transaction={props.transaction}
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
      transaction={props.transaction}
      onCheckedChange={props.onCheckedChange}
    >
      {props.transaction && (
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
          {props.transaction.movement_id && movementOpen && (
            <MovementForm
              onClose={() => setMovementOpen(false)}
              movementId={props.transaction.movement_id}
              open
            />
          )}
          <ActionButton
            tooltip="See Movement"
            icon="arrows alternate horizontal"
            onClick={() => setMovementOpen(true)}
            disabled={props.loading}
          />

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
      )}
    </TransactionCard>
  );
}

function TransactionCardConsolidated(props: {
  transaction: MovementApiOut;
  checked?: boolean;
  onCheckedChange?: (x: boolean) => void;
  checkBoxDisabled?: boolean;
  loading?: boolean;
}) {
  return (
    <MovementCard
      checked={props.checked}
      loading={props.loading}
      movement={props.transaction}
      onCheckedChange={props.onCheckedChange}
    />
  );
}

TransactionCard.Preview = TransactionCardPreview;
TransactionCard.Simple = TransactionCardSimple;
TransactionCard.Consolidated = TransactionCardConsolidated;
