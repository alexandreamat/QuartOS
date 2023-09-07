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

export function TransactionCard(
  props:
    | {
        transaction: TransactionApiOut;
      }
    | {
        // from transactions
        transaction: TransactionApiOut;
        onOpenEditMovementForm: () => void;
        onOpenEditForm: () => void;
        explanationRate?: number;
        onCheckboxChange?: (x: boolean) => void;
        checked?: boolean;
        checkBoxDisabled: false;
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

  const currencyLabel = (
    <div>
      Total:
      {accountQueries.account ? (
        <CurrencyLabel
          amount={props.transaction.amount}
          currencyCode={accountQueries.account.currency_code}
        />
      ) : (
        <CurrencyLabel.Placeholder />
      )}
    </div>
  );

  const account = accountQueries.account;
  const movement = movementQuery.data;
  const transaction = props.transaction;

  const filesQuery =
    api.endpoints.readManyApiUsersMeAccountsAccountIdMovementsMovementIdTransactionsTransactionIdFilesGet.useQuery(
      "id" in props.transaction && account && movement
        ? {
            accountId: account.id,
            movementId: movement.id,
            transactionId: props.transaction.id,
          }
        : skipToken
    );

  return (
    <Card fluid color="teal" style={{ marginLeft: 0, marginRight: 0 }}>
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
              account={accountQueries.account!}
              institution={accountQueries.institution}
              width={"1.5em"}
            />
            <LineWithHiddenOverflow
              content={accountQueries.account?.name || ""}
              style={{ width: "8em" }}
            />
          </LoadableQuery>
          <FlexRow.Auto>
            <Header as="h5">
              <LineWithHiddenOverflow content={props.transaction.name} />
            </Header>
          </FlexRow.Auto>
          {"id" in transaction &&
            filesQuery.data &&
            filesQuery.data.length !== 0 && (
              <ModalFileViewer
                files={filesQuery.data}
                transaction={transaction}
              />
            )}
          {movementQuery.data && (
            <ActionButton
              tooltip="Edit Movement"
              icon="arrows alternate horizontal"
              content={movementQuery.data.transactions.length.toFixed(0)}
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
                  {accountQueries.account && (
                    <FormattedCurrency
                      amount={props.transaction.account_balance || 0}
                      currencyCode={accountQueries.account.currency_code}
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
