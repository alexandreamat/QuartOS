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

import { TransactionApiOut } from "app/services/api";
import CurrencyLabel from "components/CurrencyLabel";
import FormattedTimestamp from "components/FormattedTimestamp";
import AccountIcon from "features/account/components/Icon";
import { useAccountQueries } from "features/account/hooks";
import { Popup, Step } from "semantic-ui-react";
import ClickableIcon from "components/ClickableIcon";
import React, { CSSProperties, useState } from "react";
import LineWithHiddenOverflow from "components/LineWithHiddenOverflow";
import ModalFileViewer from "features/transaction/components/ModalFileViewer";
import FlexRow from "components/FlexRow";
import TransactionForm from "features/transaction/components/Form";

const flowPadding = "5px 15px 5px 15px";
const flowGap = "10px";
const stepPadding = "10px";

function Flow(props: {
  transaction?: TransactionApiOut;
  onRemove?: () => void;
  loading?: boolean;
  style?: CSSProperties;
  reverse?: boolean;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [fileOpen, setFileOpen] = useState(false);

  const accountQueries = useAccountQueries(props.transaction?.account_id);

  const currencyCode = accountQueries.account?.currency_code;

  const children = [
    <Popup
      disabled={!props.loading && !accountQueries.isLoading}
      hideOnScroll
      position="top center"
      content={
        props.transaction &&
        currencyCode &&
        `Account balance: ${props.transaction.account_balance.toLocaleString(
          undefined,
          {
            style: "currency",
            currency: currencyCode,
          },
        )}`
      }
      trigger={
        <div>
          <CurrencyLabel
            amount={props.transaction?.amount}
            currencyCode={currencyCode}
            loading={props.loading || accountQueries.isLoading}
          />
        </div>
      }
    />,
    <FlexRow.Auto>
      <Popup
        hideOnScroll
        position="top center"
        content={
          <FormattedTimestamp timestamp={props.transaction?.timestamp} />
        }
        trigger={
          <div>
            <LineWithHiddenOverflow
              content={props.transaction?.name}
              loading={props.loading}
              style={props.style}
            />
          </div>
        }
      />
    </FlexRow.Auto>,
    <Popup
      disabled={!props.loading && !accountQueries.isLoading}
      hideOnScroll
      content={accountQueries.account?.name}
      trigger={
        <div>
          <AccountIcon
            account={accountQueries.account}
            institution={accountQueries.institution}
            loading={props.loading || accountQueries.isLoading}
            style={{ width: "2em" }}
          />
        </div>
      }
    />,
    props.transaction && props.transaction.files.length > 0 && (
      <ClickableIcon
        name="file"
        onClick={() => setFileOpen(true)}
        loading={props.loading}
      />
    ),
    <ClickableIcon
      name="ellipsis horizontal"
      onClick={() => setFormOpen(true)}
      loading={props.loading}
    />,
    props.onRemove && (
      <ClickableIcon
        name="remove circle"
        onClick={props.onRemove}
        loading={props.loading}
      />
    ),
  ];

  return (
    <FlexRow gap={flowGap} alignItems="center" style={{ padding: flowPadding }}>
      {fileOpen && props.transaction && (
        <ModalFileViewer
          transaction={props.transaction}
          onClose={() => setFileOpen(false)}
        />
      )}
      {formOpen && props.transaction && (
        <TransactionForm.Edit
          open
          onClose={() => setFormOpen(false)}
          movementId={props.transaction.movement_id}
          transaction={props.transaction}
        />
      )}
      {(props.reverse ? children.reverse() : children).map(
        (child, i) => child && React.cloneElement(child, { key: i }),
      )}
    </FlexRow>
  );
}

function StepFlows(props: {
  onRemove?: (x: TransactionApiOut) => void;
  selectedAccountId?: number;
  transactions?: TransactionApiOut[];
  loading?: boolean;
  filterPredicate: (t: TransactionApiOut) => boolean;
  reverse?: boolean;
}) {
  const flows = props.transactions?.filter(props.filterPredicate);

  const hasFlows = flows && flows.length > 0;

  if (!props.loading && !hasFlows) return <></>;

  return (
    <Step style={{ padding: stepPadding }}>
      <Step.Content style={{ width: "100%" }}>
        {props.loading ? (
          <Flow loading reverse={props.reverse} />
        ) : (
          hasFlows &&
          flows.map((t) => (
            <Flow
              key={t.id}
              transaction={t}
              onRemove={
                props.onRemove && (() => props.onRemove && props.onRemove(t))
              }
              style={{
                fontWeight:
                  t.account_id === props.selectedAccountId ? "bold" : "normal",
              }}
              reverse={props.reverse}
            />
          ))
        )}
      </Step.Content>
    </Step>
  );
}

export function Flows(props: {
  onRemove?: (x: TransactionApiOut) => void;
  selectedAccountId?: number;
  transactions?: TransactionApiOut[];
  loading?: boolean;
}) {
  return (
    <Step.Group fluid widths={2}>
      <StepFlows
        loading={props.loading}
        onRemove={props.onRemove}
        selectedAccountId={props.selectedAccountId}
        transactions={props.transactions}
        filterPredicate={(t) => t.amount < 0}
        reverse
      />
      <StepFlows
        loading={props.loading}
        onRemove={props.onRemove}
        selectedAccountId={props.selectedAccountId}
        transactions={props.transactions}
        filterPredicate={(t) => t.amount >= 0}
      />
    </Step.Group>
  );
}
