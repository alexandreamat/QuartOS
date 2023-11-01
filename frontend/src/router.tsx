import Accounts from "features/account";
import React from "react";
import Transactions from "features/transaction";
import InstitutionLinks from "features/institutionlink";
import Institutions from "features/institution";
import Users from "features/user";
import { SemanticICONS } from "semantic-ui-react";
import TransactionDeserialisers from "features/transactiondeserialiser";
import Movements from "features/movements";
import PL from "features/pl";
import plDetail from "features/pl/components/PLReport";

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
  // {
  //   path: "/",
  //   label: "Account",
  //   icon: "home",
  //   component: Dashboard,
  //   requires_superuser: false,
  // },
  {
    path: "/institution-links",
    label: "My Institutions",
    icon: "university",
    component: InstitutionLinks,
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
    path: "/movements/:accountId?",
    link: "/movements",
    label: "Movements",
    icon: "arrows alternate horizontal",
    component: Movements,
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
        path: "/:startDate/:endDate",
        label: "P&L Statement Detail",
        icon: "file alternate",
        component: plDetail,
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
