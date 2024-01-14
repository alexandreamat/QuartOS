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

import { useState } from "react";
import { Card } from "semantic-ui-react";
import { AccountApiOut } from "app/services/api";
import EditActionButton from "components/EditActionButton";
import { useNavigate } from "react-router-dom";
import { useInstitutionLinkQueries } from "features/institutionlink/hooks";
import CurrencyLabel from "components/CurrencyLabel";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import ActionButton from "components/ActionButton";
import Uploader from "./Uploader";

export default function AccountCard(props: {
  account: AccountApiOut;
  onEdit: () => void;
}) {
  const navigate = useNavigate();

  const institutionLinkQueries = useInstitutionLinkQueries(
    props.account.institutionalaccount?.userinstitutionlink_id,
  );

  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const handleUpload = () => {
    setIsUploaderOpen(true);
  };

  const handleCloseUploader = () => {
    setIsUploaderOpen(false);
  };

  function handleGoToTransactions() {
    navigate(`/transactions/?accountId=${props.account.id}`);
  }

  function handleGoToMovements() {
    navigate(`/movements/?accountId=${props.account.id}`);
  }

  return (
    <Card color="teal">
      {isUploaderOpen && (
        <Uploader account={props.account} onClose={handleCloseUploader} />
      )}
      <Card.Content>
        <InstitutionLogo
          floated="right"
          institution={institutionLinkQueries.institution}
          loading={institutionLinkQueries.isLoading}
          style={{ width: "3em" }}
        />
        <Card.Header>{props.account.name}</Card.Header>
        <Card.Meta>
          {props.account.institutionalaccount &&
            `**** ${props.account.institutionalaccount.mask}`}
        </Card.Meta>
        <Card.Meta>{institutionLinkQueries.institution?.name}</Card.Meta>
      </Card.Content>
      <Card.Content extra textAlign="right">
        <EditActionButton
          floated="left"
          disabled={props.account.is_synced !== false}
          onOpenEditForm={props.onEdit}
        />
        <ActionButton
          icon="exchange"
          tooltip="See transactions"
          floated="left"
          onClick={handleGoToTransactions}
        />
        <ActionButton
          icon="arrows alternate horizontal"
          tooltip="See movements"
          floated="left"
          onClick={handleGoToMovements}
        />

        {props.account.institutionalaccount && (
          <ActionButton
            floated="left"
            icon="upload"
            onClick={handleUpload}
            tooltip="Upload transactions sheet"
          />
        )}
        <CurrencyLabel
          amount={Number(props.account.balance)}
          currencyCode={props.account.currency_code}
        />
      </Card.Content>
    </Card>
  );
}
