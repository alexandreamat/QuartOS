import { AccountApiOut, InstitutionApiOut } from "app/services/api";
import { Icon, Placeholder } from "semantic-ui-react";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import { accountTypeToIconName } from "features/account/utils";

export default function AccountIcon(props: {
  account?: AccountApiOut;
  institution?: InstitutionApiOut;
  loading?: boolean;
}) {
  if (props.loading)
    return (
      <Placeholder style={{ width: "18em" }}>
        <Placeholder.Header image />
      </Placeholder>
    );

  if (props.institution)
    return <InstitutionLogo institution={props.institution} />;

  if (props.account)
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

  return <Icon />;
}
