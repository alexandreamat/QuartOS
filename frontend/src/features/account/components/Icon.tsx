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

import { AccountApiOut } from "app/services/api";
import { accountTypeToIconName } from "features/account/utils";
import { InstitutionLogo } from "features/institution/components/InstitutionLogo";
import { CSSProperties } from "react";
import { Icon, Placeholder } from "semantic-ui-react";
import { useAccountQueries } from "../hooks";

export default function AccountIcon(props: {
  account?: AccountApiOut;
  loading?: boolean;
  style?: CSSProperties;
}) {
  const accountQueries = useAccountQueries(props.account?.id);

  if (props.loading)
    return (
      <Placeholder>
        <Placeholder.Header image />
      </Placeholder>
    );

  if (!props.account) return <Icon name="warning" />;

  if (props.account.is_institutional) {
    return (
      <InstitutionLogo
        institution={accountQueries.institution}
        style={props.style}
        loading={accountQueries.isLoading}
      />
    );
  } else {
    return (
      <Icon
        color="grey"
        name={accountTypeToIconName(props.account.type)}
        style={props.style}
      />
    );
  }

  return <Icon name="warning" />;
}
