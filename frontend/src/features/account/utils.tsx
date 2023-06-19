import { SemanticICONS } from "semantic-ui-react";
import {
  InstitutionalAccountType,
  NonInstitutionalAccountType,
} from "app/services/api";

export function accountTypeToIconName(
  type: InstitutionalAccountType | NonInstitutionalAccountType
): SemanticICONS {
  switch (type) {
    case "brokerage":
      return "dollar sign";
    case "cash":
      return "money bill alternate";
    case "credit":
      return "credit card";
    case "depository":
      return "university";
    case "investment":
      return "chart line";
    case "loan":
      return "handshake outline";
    case "personal ledger":
      return "book";
    case "property":
      return "home";
    default:
      return "credit card";
  }
}
