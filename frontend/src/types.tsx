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

import { BaseQueryFn, QueryDefinition } from "@reduxjs/toolkit/dist/query";
import { ApiEndpointQuery } from "@reduxjs/toolkit/dist/query/core/module";
import { UpdateDefinitions } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { QueryHooks } from "@reduxjs/toolkit/dist/query/react/buildHooks";

export type UseStateType<T> = [T, React.Dispatch<React.SetStateAction<T>>];

export type PaginatedQueryArg<P> = P & { page?: number; perPage?: number };

type PaginatedQueryDefinition<
  B extends BaseQueryFn,
  T extends string,
  R,
  P,
> = QueryDefinition<PaginatedQueryArg<P>, B, T, R[]>;

export type PaginatedQueryEndpoint<
  B extends BaseQueryFn,
  T extends string,
  R,
  P,
> = ApiEndpointQuery<
  PaginatedQueryDefinition<B, T, R, P>,
  UpdateDefinitions<never, T, never>
> &
  QueryHooks<PaginatedQueryDefinition<B, T, R, P>>;
export type PaginatedItemProps<R> = { response?: R; loading?: boolean };
