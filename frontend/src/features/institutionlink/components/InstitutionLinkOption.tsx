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

import { UserInstitutionLinkApiOut, api } from "app/services/api";

export default function InstitutionLinkOption(props: {
  institutionLink: UserInstitutionLinkApiOut;
}) {
  const { data: institution } =
    api.endpoints.readInstitutionsInstitutionIdGet.useQuery(
      props.institutionLink.institution_id,
    );

  return <>{institution?.name}</>;
}
