import { TransactionApiIn, TransactionApiOut } from "app/services/api";
import {
  Card,
  Checkbox,
  CheckboxProps,
  Grid,
  Header,
  Popup,
} from "semantic-ui-react";
import LoadableQuery from "components/LoadableCell";
import { useAccountQueries } from "features/account/hooks";
import CurrencyLabel from "components/CurrencyLabel";
import FormattedTimestamp from "components/FormattedTimestamp";
import ActionButton from "components/ActionButton";
import AccountIcon from "features/account/components/Icon";
import { FormattedCurrency } from "components/FormattedCurrency";
import LimitedText from "components/LimitedString";
import MutateActionButton from "components/MutateActionButton";

export function TransactionCard(
  props:
    | {
        transaction: TransactionApiOut;
      }
    | {
        // from transactions or movement with 1 transaction
        transaction: TransactionApiOut;
        onGoMovement: () => void;
        onOpenEditForm: () => void;
      }
    | {
        // from movement form
        transaction: TransactionApiOut;
        onOpenEditForm: () => void;
        onCheckboxChange: (x: boolean) => Promise<void>;
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

  return (
    <Card fluid color="teal">
      <Card.Content>
        <Grid columns="equal" verticalAlign="middle">
          <Grid.Column width={2}>
            <Card.Meta>
              <FormattedTimestamp timestamp={props.transaction.timestamp} />
            </Card.Meta>
          </Grid.Column>
          <Grid.Column width={3}>
            <LoadableQuery query={accountQueries}>
              <AccountIcon
                account={accountQueries.account!}
                institution={accountQueries.institution}
              />
              {accountQueries.account?.name}
            </LoadableQuery>
          </Grid.Column>
          <Grid.Column>
            <Header as="h5">
              <LimitedText str={props.transaction.name} maxLength={50} />
            </Header>
          </Grid.Column>
          {"onCheckboxChange" in props && (
            <Grid.Column width={1} textAlign="center" verticalAlign="middle">
              <Popup
                content={
                  props.checked
                    ? "Remove from the movement"
                    : "Add to the movement"
                }
                trigger={
                  <Checkbox
                    disabled={props.checkBoxDisabled}
                    checked={props.checked}
                    onChange={async (_: unknown, data: CheckboxProps) =>
                      await props.onCheckboxChange!(data.checked || false)
                    }
                  />
                }
              />
            </Grid.Column>
          )}
          {"onGoMovement" in props && (
            <Grid.Column width={1} textAlign="center">
              <ActionButton
                tooltip="Edit Movement"
                icon="arrows alternate horizontal"
                onClick={props.onGoMovement!}
              />
            </Grid.Column>
          )}
          {"onOpenEditForm" in props && (
            <Grid.Column width={1} textAlign="center">
              <MutateActionButton onOpenEditForm={props.onOpenEditForm} />
            </Grid.Column>
          )}
        </Grid>
      </Card.Content>
      <Card.Content extra>
        <Header as="h5" floated="right">
          <Popup
            position="left center"
            content={
              <p>
                Account balance:
                <FormattedCurrency
                  amount={props.transaction.account_balance || 0}
                  currencyCode={props.transaction.currency_code}
                />
              </p>
            }
            trigger={
              <div>
                Total:
                <CurrencyLabel
                  amount={props.transaction.amount}
                  currencyCode={props.transaction.currency_code}
                />
              </div>
            }
          />
        </Header>
      </Card.Content>
    </Card>
  );
}
