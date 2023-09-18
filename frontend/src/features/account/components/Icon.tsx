import { AccountApiOut, InstitutionApiOut } from "app/services/api";
import { Icon, Placeholder } from "semantic-ui-react";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import { accountTypeToIconName } from "features/account/utils";
import { CSSProperties } from "react";

export default function AccountIcon(props: {
  account?: AccountApiOut;
  institution?: InstitutionApiOut;
  loading?: boolean;
  style?: CSSProperties;
}) {
  if (props.loading)
    return (
      <Placeholder>
        <Placeholder.Header image />
      </Placeholder>
    );

  if (props.institution)
    return (
      <InstitutionLogo institution={props.institution} style={props.style} />
    );

  if (props.account)
    return (
      <Icon
        color="grey"
        name={accountTypeToIconName(
          props.account.institutionalaccount?.type ||
            props.account.noninstitutionalaccount?.type ||
            "other",
        )}
        style={props.style}
      />
    );

  return <Icon />;
}
