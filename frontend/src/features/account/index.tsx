import { useState } from "react";
import { Loader, Icon, Menu, Card, Divider, Header } from "semantic-ui-react";
import Form from "./components/Form";
import {
  AccountApiOut,
  InstitutionalAccountType,
  NonInstitutionalAccountType,
  api,
} from "app/services/api";
import EditActionButton from "components/EditActionButton";
import LoadableQuery from "components/LoadableCell";
import { useLocation, useNavigate } from "react-router-dom";
import { useInstitutionLinkQueries } from "features/institutionlink/hooks";
import { capitaliseFirstLetter } from "utils/string";
import CurrencyLabel from "components/CurrencyLabel";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import { accountTypeToIconName } from "./utils";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import FlexColumn from "components/FlexColumn";
import CreateNewButton from "components/CreateNewButton";
import ActionButton from "components/ActionButton";
import Uploader from "./components/Uploader";

function AccountCard(props: { account: AccountApiOut; onEdit: () => void }) {
  const navigate = useNavigate();

  const institutionLinkQueries = useInstitutionLinkQueries(
    props.account.institutionalaccount?.userinstitutionlink_id
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
      <Uploader
        open={isUploaderOpen}
        account={props.account}
        onClose={handleCloseUploader}
      />
      <Card.Content>
        <LoadableQuery query={institutionLinkQueries}>
          <InstitutionLogo
            height={36}
            floated="right"
            institution={institutionLinkQueries.institution!}
          />
        </LoadableQuery>
        <Card.Header>{props.account.name}</Card.Header>
        <Card.Meta>
          {props.account.institutionalaccount && (
            <>**** {props.account.institutionalaccount.mask}</>
          )}
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

        {!props.account.is_synced && props.account.institutionalaccount && (
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

export default function Accounts() {
  const [selectedAccount, setSelectedAccount] = useState<
    AccountApiOut | undefined
  >(undefined);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isFormOpenParam = params.get("isFormOpen") === "true";

  const [isFormOpen, setIsFormOpen] = useState(isFormOpenParam);

  const accountsQuery = api.endpoints.readManyApiAccountsGet.useQuery();

  const handleCreate = () => {
    setSelectedAccount(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (account: AccountApiOut) => {
    setSelectedAccount(account);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setSelectedAccount(undefined);
    setIsFormOpen(false);
  };

  if (accountsQuery.isLoading || accountsQuery.isUninitialized)
    return <Loader active size="huge" />;

  if (accountsQuery.isError) return <QueryErrorMessage query={accountsQuery} />;

  const accounts = accountsQuery.data;

  const groupedAccounts = accounts.reduce((acc, account) => {
    const type = account.institutionalaccount
      ? account.institutionalaccount.type
      : account.noninstitutionalaccount!.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {} as Record<InstitutionalAccountType | NonInstitutionalAccountType, AccountApiOut[]>);

  return (
    <FlexColumn>
      <Form account={selectedAccount} open={isFormOpen} onClose={handleClose} />
      <Menu secondary>
        <Menu.Item>
          <CreateNewButton onCreate={handleCreate} />
        </Menu.Item>
      </Menu>
      <FlexColumn.Auto>
        {Object.keys(groupedAccounts).map((type) => (
          <>
            <Divider horizontal section>
              <Header as="h4">
                <Icon
                  name={accountTypeToIconName(
                    type as
                      | InstitutionalAccountType
                      | NonInstitutionalAccountType
                  )}
                />
                {capitaliseFirstLetter(type)}
              </Header>
            </Divider>
            <Card.Group centered>
              {groupedAccounts[
                type as InstitutionalAccountType | NonInstitutionalAccountType
              ].map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={() => handleEdit(account)}
                />
              ))}
            </Card.Group>
          </>
        ))}
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
