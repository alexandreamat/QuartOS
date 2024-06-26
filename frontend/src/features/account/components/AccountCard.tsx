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

import { AccountApiOut } from "app/services/api";
import ActionButton from "components/ActionButton";
import CurrencyLabel from "components/CurrencyLabel";
import EditActionButton from "components/EditActionButton";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import { useInstitutionLinkQueries } from "features/institutionlink/hooks";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "semantic-ui-react";
import Uploader from "./Uploader";
import AccountForm from "./Form";

export default function AccountCard(props: { account: AccountApiOut }) {
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);

  const institutionLinkQueries = useInstitutionLinkQueries(
    props.account.is_institutional
      ? props.account.user_institution_link_id
      : undefined,
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

  return (
    <Card color="teal">
      {isUploaderOpen && (
        <Uploader account={props.account} onClose={handleCloseUploader} />
      )}
      {isFormOpen && (
        <AccountForm
          account={props.account}
          onClose={() => setIsFormOpen(false)}
        />
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
          {props.account.is_institutional && `**** ${props.account.mask}`}
        </Card.Meta>
        <Card.Meta>{institutionLinkQueries.institution?.name}</Card.Meta>
      </Card.Content>
      <Card.Content extra textAlign="right">
        <EditActionButton
          floated="left"
          onOpenEditForm={() => setIsFormOpen(true)}
        />
        <ActionButton
          icon="exchange"
          tooltip="See transactions"
          floated="left"
          onClick={handleGoToTransactions}
        />

        {props.account.is_institutional && (
          <ActionButton
            floated="left"
            icon="upload"
            onClick={handleUpload}
            tooltip="Upload transactions sheet"
          />
        )}
        <CurrencyLabel
          amount={props.account.balance}
          currencyCode={props.account.currency_code}
        />
      </Card.Content>
    </Card>
  );
}
