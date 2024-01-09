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
