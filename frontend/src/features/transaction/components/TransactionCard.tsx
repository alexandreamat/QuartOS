import { skipToken } from "@reduxjs/toolkit/dist/query";
import { TransactionApiIn, TransactionApiOut, api } from "app/services/api";
import ActionButton from "components/ActionButton";
import CurrencyLabel from "components/CurrencyLabel";
import FlexRow from "components/FlexRow";
import { FormattedCurrency } from "components/FormattedCurrency";
import FormattedTimestamp from "components/FormattedTimestamp";
import LineWithHiddenOverflow from "components/LineWithHiddenOverflow";
import AccountIcon from "features/account/components/Icon";
import { useAccountQueries } from "features/account/hooks";
import MovementForm from "features/movements/components/Form";
import { useState } from "react";
import { Card, Checkbox, Header, Popup } from "semantic-ui-react";
import { useUploadTransactionFile } from "../hooks/useUploadTransactionFile";
import TransactionForm from "./Form";
import ModalFileViewer from "./ModalFileViewer";

export function TransactionCard(
  props:
    | {
        // from transactions or movement
        transaction?: TransactionApiOut;
        checked?: boolean;
        onCheckedChange?: (x: boolean) => void;
        checkBoxDisabled?: boolean;
        loading?: boolean;
        preview?: false;
      }
    | {
        // from preview
        checked: boolean;
        onCheckedChange: (x: boolean) => void;
        transaction?: TransactionApiIn;
        checkBoxDisabled?: false;
        accountId: number;
        loading?: false;
        preview: true;
      },
) {
  const accountQueries = useAccountQueries(
    props.preview ? props.accountId : props.transaction?.account_id,
  );

  const movementQuery =
    api.endpoints.readApiUsersMeMovementsMovementIdGet.useQuery(
      props.preview || !props.transaction
        ? skipToken
        : props.transaction.movement_id,
    );

  const uploadTransactionFile = useUploadTransactionFile(
    props.preview ? undefined : props.transaction,
  );

  const account = accountQueries.account;
  const movement = movementQuery.data;

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
    <Card
      fluid
      color="teal"
      onDrop={handleFileDrop}
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
            institution={accountQueries.institution}
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
          <FlexRow.Auto>
            <Header as="h5">
              <LineWithHiddenOverflow
                content={props.transaction?.name}
                loading={props.loading}
              />
            </Header>
          </FlexRow.Auto>
          {!props.preview && props.transaction && (
            <>
              {/* See files button and form */}
              {fileOpen && (
                <ModalFileViewer
                  transaction={props.transaction}
                  onClose={() => setFileOpen(false)}
                />
              )}
              {props.transaction?.files.length !== 0 && (
                <ActionButton
                  tooltip="See files"
                  icon="file"
                  content={props.transaction?.files.length.toFixed(0)}
                  loading={props.loading}
                  onClick={() => setFileOpen(true)}
                />
              )}

              {/* See movement button and form */}
              {movementOpen && (
                <MovementForm
                  onClose={() => setMovementOpen(false)}
                  movementId={props.transaction.movement_id}
                  open
                />
              )}
              <ActionButton
                tooltip="See Movement"
                icon="arrows alternate horizontal"
                content={movement?.transactions.length.toFixed(0)}
                onClick={() => setMovementOpen(true)}
                loading={movementQuery.isLoading}
                negative={movementQuery.isError}
                disabled={props.loading}
              />

              {/* See more button and form */}
              {formOpen && (
                <TransactionForm.Edit
                  onClose={() => setFormOpen(false)}
                  movementId={props.transaction.movement_id}
                  transaction={props.transaction}
                  open
                />
              )}
              <ActionButton
                icon="ellipsis horizontal"
                onClick={() => setFormOpen(true)}
                disabled={props.loading}
              />
            </>
          )}
        </FlexRow>
      </Card.Content>
      <Card.Content extra>
        <FlexRow justifyContent="right" gap="1ch" alignItems="baseline">
          <div style={{ color: "black", fontWeight: "bold" }}>Total:</div>
          <Popup
            disabled={props.preview}
            position="left center"
            content={
              !props.preview &&
              props.transaction &&
              account && (
                <p>
                  {`Account balance: ${props.transaction.account_balance.toLocaleString(
                    undefined,
                    {
                      style: "currency",
                      currency: account.currency_code,
                    },
                  )}`}
                </p>
              )
            }
            trigger={
              <div>
                <CurrencyLabel
                  amount={props.transaction?.amount}
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
