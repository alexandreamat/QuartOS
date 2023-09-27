import { useState } from "react";
import { Card } from "semantic-ui-react";
import { AccountApiOut } from "app/services/api";
import { useNavigate } from "react-router-dom";
import { useInstitutionLinkQueries } from "features/institutionlink/hooks";
import CurrencyLabel from "components/CurrencyLabel";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import ActionButton from "components/ActionButton";
import Uploader from "./Uploader";
import MutateActionButton from "components/MutateActionButton";

export default function AccountCard(props: {
  account: AccountApiOut;
  onEdit: () => void;
}) {
  const navigate = useNavigate();

  const institutionLinkQueries = useInstitutionLinkQueries(
    "userinstitutionlink_id" in props.account
      ? props.account.userinstitutionlink_id
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

  function handleGoToMovements() {
    navigate(`/movements/?accountId=${props.account.id}`);
  }

  return (
    <Card color="teal">
      <Uploader
        open={isUploaderOpen}
        account={props.account}
        onClose={handleCloseUploader}
      />
      <Card.Content>
        <InstitutionLogo
          floated="right"
          institution={institutionLinkQueries.institution}
          loading={institutionLinkQueries.isLoading}
          style={{ width: "3em" }}
        />
        <Card.Header>{props.account.name}</Card.Header>
        <Card.Meta>
          {props.account.type === "depository" &&
            props.account.iban?.replace(
              /^(\w{4})(\w{4})(\w{4})(\w{4})(\w{4})(\w{4})$/,
              "$1 $2 $3 $4 $5 $6",
            )}
        </Card.Meta>
        <Card.Meta>{institutionLinkQueries.institution?.name}</Card.Meta>
      </Card.Content>
      <Card.Content extra textAlign="right">
        <MutateActionButton floated="left" onOpenEditForm={props.onEdit} />
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

        {props.account.type === "depository" && (
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
