import { AccountApiOut, InstitutionApiOut } from "app/services/api";
import { Icon } from "semantic-ui-react";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import { accountTypeToIconName } from "features/account/utils";

export default function AccountIcon(props: {
  account: AccountApiOut;
  institution?: InstitutionApiOut;
}) {
  console.log(props);
  if (props.institution)
    return <InstitutionLogo institution={props.institution} />;

  return (
    <Icon
      color="grey"
      name={accountTypeToIconName(
        props.account.institutionalaccount?.type ||
          props.account.noninstitutionalaccount?.type ||
          "other"
      )}
    />
  );
}
