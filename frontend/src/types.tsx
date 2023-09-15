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
