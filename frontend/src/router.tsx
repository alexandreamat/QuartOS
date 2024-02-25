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

import Accounts from "features/account";
import Dashboard from "features/dashboard";
import Institutions from "features/institution";
import InstitutionLinks from "features/institutionlink";
import Merchants from "features/merchants";
import Movements from "features/movements";
import PL from "features/pl";
import PLStatement from "features/pl/components/PLStatement";
import Transactions from "features/transaction";
import TransactionDeserialisers from "features/transactiondeserialiser";
import Users from "features/user";
import React from "react";
import { SemanticICONS } from "semantic-ui-react";

export interface RouteI {
  path: string;
  link?: string;
  label: string;
  icon: SemanticICONS;
  component: React.FC;
  requires_superuser: boolean;
  routes?: RouteI[];
}

export default [
  {
    path: "/",
    label: "Account",
    icon: "home",
    component: Dashboard,
    requires_superuser: false,
  },
  {
    path: "/institution-links",
    label: "My Institutions",
    icon: "university",
    component: InstitutionLinks,
    requires_superuser: false,
  },
  {
    path: "/merchants",
    label: "Merchants",
    icon: "shop",
    component: Merchants,
    requires_superuser: false,
  },
  {
    path: "/accounts",
    label: "Accounts",
    icon: "credit card",
    component: Accounts,
    requires_superuser: false,
  },
  {
    path: "/transactions/:accountId?",
    link: "/transactions",
    label: "Transactions",
    icon: "exchange",
    component: Transactions,
    requires_superuser: false,
  },
  {
    path: "/pl-statements",
    label: "P&L Statements",
    icon: "dollar",
    component: PL,
    requires_superuser: false,
    routes: [
      {
        path: "/:startDate",
        label: "P&L Statement Detail",
        icon: "file alternate",
        component: PLStatement,
        requires_superuser: false,
      },
    ],
  },
  {
    path: "/institutions",
    label: "Institutions",
    icon: "university",
    component: Institutions,
    requires_superuser: true,
  },
  {
    path: "/transaction-deserialisers",
    label: "Deserialisers",
    icon: "code",
    component: TransactionDeserialisers,
    requires_superuser: true,
  },
  {
    path: "/users",
    label: "Users",
    icon: "user",
    component: Users,
    requires_superuser: true,
  },
] as RouteI[];
