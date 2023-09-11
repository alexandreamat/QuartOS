import { TransactionApiIn, TransactionApiOut, api } from "app/services/api";
import {
  Card,
  Checkbox,
  CheckboxProps,
  Header,
  Placeholder,
  Popup,
} from "semantic-ui-react";
import LoadableQuery from "components/LoadableCell";
import { useAccountQueries } from "features/account/hooks";
import CurrencyLabel from "components/CurrencyLabel";
import FormattedTimestamp from "components/FormattedTimestamp";
import ActionButton from "components/ActionButton";
import AccountIcon from "features/account/components/Icon";
import { FormattedCurrency } from "components/FormattedCurrency";
import LineWithHiddenOverflow from "components/LineWithHiddenOverflow";
import MutateActionButton from "components/MutateActionButton";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import FlexRow from "components/FlexRow";
import ModalFileViewer from "./ModalFileViewer";
import { useUploadTransactionFile } from "../hooks/useUploadTransactionFile";

export function TransactionCard(
  props:
    | {
        // from transactions
        transaction: TransactionApiOut;
        onOpenEditMovementForm: () => void;
        onOpenEditForm: () => void;
        explanationRate?: number;
        onCheckboxChange?: (x: boolean) => void;
        checked?: boolean;
        checkBoxDisabled?: false;
        onMutation: () => void;
      }
    | {
        // from movement form
        transaction: TransactionApiOut;
        onOpenEditForm: () => void;
        onCheckboxChange: (x: boolean) => void;
        checkBoxDisabled: boolean;
        checked: boolean;
      }
    | {
        // from preview
        transaction: TransactionApiIn;
        accountId: number;
      }
) {
  const accountQueries = useAccountQueries(
    "accountId" in props ? props.accountId : props.transaction.account_id
  );

  const movementQuery =
    api.endpoints.readApiUsersMeMovementsMovementIdGet.useQuery(
      "movement_id" in props.transaction
        ? props.transaction.movement_id
        : skipToken
    );

  const uploadTransactionFile = useUploadTransactionFile(
    "id" in props.transaction ? props.transaction : undefined
  );

  const account = accountQueries.account;
  const movement = movementQuery.data;
  const transaction = props.transaction;

  const currencyLabel = (
    <div>
      Total:
      {account ? (
        <CurrencyLabel
          amount={props.transaction.amount}
          currencyCode={account.currency_code}
        />
      ) : (
        <CurrencyLabel.Placeholder />
      )}
    </div>
  );

  async function handleFileDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    await uploadTransactionFile.onUpload(file);
    if ("onMutation" in props) props.onMutation();
  }

  return (
    <Card
      fluid
      color="teal"
      onDrop={handleFileDrop}
      onDragOver={(e: DragEvent) => e.preventDefault()}
    >
      <Card.Content>
        <FlexRow style={{ gap: 5 }}>
          {"onCheckboxChange" in props && props.onCheckboxChange && (
            <Popup
              content={
                props.checked
                  ? "Remove from the movement"
                  : "Add to the movement"
              }
              trigger={
                <Checkbox
                  disabled={
                    "checkBoxDisabled" in props && props.checkBoxDisabled
                  }
                  checked={props.checked}
                  onChange={async (_: unknown, data: CheckboxProps) =>
                    await props.onCheckboxChange!(data.checked || false)
                  }
                />
              }
            />
          )}
          <Card.Meta>
            <FormattedTimestamp timestamp={props.transaction.timestamp} />
          </Card.Meta>
          <LoadableQuery query={accountQueries}>
            <AccountIcon
              account={account!}
              institution={accountQueries.institution}
            />
            <LineWithHiddenOverflow
              content={account?.name || ""}
              style={{ width: "8em" }}
            />
          </LoadableQuery>
          <FlexRow.Auto>
            <Header as="h5">
              <LineWithHiddenOverflow content={props.transaction.name} />
            </Header>
          </FlexRow.Auto>
          {"id" in transaction && transaction.files.length > 0 && (
            <ModalFileViewer
              transaction={transaction}
              trigger={
                <ActionButton
                  tooltip="See files"
                  icon="file"
                  content={transaction.files.length.toFixed(0)}
                />
              }
              onMutation={"onMutation" in props ? props.onMutation : undefined}
            />
          )}
          {movement && (
            <ActionButton
              tooltip="Edit Movement"
              icon="arrows alternate horizontal"
              content={movement.transactions.length.toFixed(0)}
              disabled={!("onOpenEditMovementForm" in props)}
              onClick={
                "onOpenEditMovementForm" in props
                  ? props.onOpenEditMovementForm
                  : undefined
              }
            />
          )}
          {"onOpenEditForm" in props && (
            <MutateActionButton onOpenEditForm={props.onOpenEditForm} />
          )}
        </FlexRow>
      </Card.Content>
      <Card.Content extra>
        {"explanationRate" in props && props.explanationRate && (
          <Header sub floated="left">
            {props.explanationRate.toFixed(0)}%
          </Header>
        )}
        <Header as="h5" floated="right">
          {"account_balance" in props.transaction ? (
            <Popup
              position="left center"
              content={
                <p>
                  Account balance:
                  {account && (
                    <FormattedCurrency
                      amount={props.transaction.account_balance || 0}
                      currencyCode={account.currency_code}
                    />
                  )}
                </p>
              }
              trigger={currencyLabel}
            />
          ) : (
            currencyLabel
          )}
        </Header>
      </Card.Content>
    </Card>
  );
}

function CardPlaceholder(props: {
  onGoMovement?: boolean;
  explanationRate?: boolean;
  onOpenEditForm?: boolean;
  onCheckboxChange?: boolean;
  checkBoxDisabled?: boolean;
  checked?: boolean;
}) {
  return (
    <Card fluid color="teal">
      <Card.Content>
        <FlexRow style={{ gap: 5 }}>
          <Placeholder style={{ width: "10em" }}>
            <Placeholder.Header />
          </Placeholder>
          <Placeholder style={{ width: "18em" }}>
            <Placeholder.Header image />
          </Placeholder>
          <FlexRow.Auto>
            <Placeholder style={{ width: "100%" }}>
              <Placeholder.Header />
            </Placeholder>
          </FlexRow.Auto>
          <ActionButton icon="ellipsis horizontal" />
        </FlexRow>
      </Card.Content>
      <Card.Content extra>
        <Header as="h5" floated="right">
          <div>
            Total:
            <CurrencyLabel.Placeholder />
          </div>
        </Header>
      </Card.Content>
    </Card>
  );
}

TransactionCard.Placeholder = CardPlaceholder;
