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

import { api } from "app/services/api";
import { DropdownItemProps } from "semantic-ui-react";

export function useInstitutionOptions() {
  const query = api.endpoints.readManyApiInstitutionsGet.useQuery();

  const options: DropdownItemProps[] =
    query.data?.map((institution) => ({
      key: institution.id,
      value: institution.id,
      text: institution.name,
      image: `data:image/png;base64,${institution.logo_base64}`,
    })) || [];

  return {
    options,
    query,
  };
}
