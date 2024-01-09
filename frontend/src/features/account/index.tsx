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
import { Loader, Icon, Menu, Card, Divider, Header } from "semantic-ui-react";
import Form from "./components/Form";
import {
  AccountApiOut,
  InstitutionalAccountType,
  NonInstitutionalAccountType,
  api,
} from "app/services/api";
import { useLocation } from "react-router-dom";
import { capitaliseFirstLetter } from "utils/string";
import { accountTypeToIconName } from "./utils";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import FlexColumn from "components/FlexColumn";
import CreateNewButton from "components/CreateNewButton";
import AccountCard from "./components/AccountCard";

export default function Accounts() {
  const [selectedAccount, setSelectedAccount] = useState<
    AccountApiOut | undefined
  >(undefined);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isFormOpenParam = params.get("isFormOpen") === "true";

  const [isFormOpen, setIsFormOpen] = useState(isFormOpenParam);

  const accountsQuery = api.endpoints.readManyApiUsersMeAccountsGet.useQuery();

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
          <div key={type}>
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
            <Card.Group style={{ margin: 0 }}>
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
          </div>
        ))}
      </FlexColumn.Auto>
    </FlexColumn>
  );
}
