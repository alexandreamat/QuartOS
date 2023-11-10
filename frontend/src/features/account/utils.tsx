// Copyright (C) 2023 Alexandre Amat
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

import { SemanticICONS } from "semantic-ui-react";
import { AccountType } from "app/services/api";

export function accountTypeToIconName(type: AccountType): SemanticICONS {
  switch (type) {
    // case "brokerage":
    //   return "dollar sign";
    case "cash":
      return "money bill alternate";
    case "credit":
      return "credit card";
    case "depository":
      return "university";
    // case "investment":
    //   return "chart line";
    case "loan":
      return "handshake outline";
    case "personal_ledger":
      return "book";
    case "property":
      return "home";
    default:
      return "credit card";
  }
}
