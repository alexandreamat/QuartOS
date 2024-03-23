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

import { BaseQueryFn } from "@reduxjs/toolkit/dist/query";
import ExhaustedDataCard from "components/ExhaustedDataCard";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { format } from "date-fns";
import useStack from "hooks/useStack";
import { MutableRefObject, useCallback, useEffect, useMemo } from "react";
import { Divider } from "semantic-ui-react";
import {
  PaginatedItemProps,
  PaginatedQueryArg,
  PaginatedQueryEndpoint,
} from "types";

const PER_PAGE = 20;
const RATE = 1;

type PageComponentProps<R> = {
  response: R[];
  itemComponent: (props: PaginatedItemProps<R>) => JSX.Element;
  prevItem?: R;
};

type PageData<R> =
  | {
      success: false;
    }
  | {
      success: true;
      entries: number;
      lastItem?: R;
    };

function SimplePageComponent<R>(props: PageComponentProps<R>) {
  return (
    <>
      {props.response.map((item, i) => (
        <props.itemComponent key={i} response={item} />
      ))}
    </>
  );
}

function ByTimestampPageComponent<R extends { timestamp: Date }>(
  props: PageComponentProps<R>,
) {
  const itemsByTimestamp = Object.entries(
    props.response.reduce(
      (
        prev: { [timestamp: number]: { timestamp: Date; items: R[] } },
        item,
      ) => {
        const key = item.timestamp.getTime();
        const items = prev[key] ? [...prev[key].items, item] : [item];
        return { ...prev, [key]: { timestamp: item.timestamp, items } };
      },
      {},
    ),
  );

  return (
    <>
      {itemsByTimestamp.map(([time, { timestamp, items }], i) => (
        <div key={i} style={{ width: "100%" }}>
          {Number(time) !== props.prevItem?.timestamp.getTime() && (
            <Divider horizontal>{format(timestamp, "yyyy MMMM d")}</Divider>
          )}
          {items.map((item, j) => (
            <props.itemComponent key={`${i}.${j}`} response={item} />
          ))}
        </div>
      ))}
    </>
  );
}

function PageContainer<B extends BaseQueryFn, T extends string, R, P>(props: {
  pageNum: number;
  params: P;
  endpoint: PaginatedQueryEndpoint<B, T, R, P>;
  onSuccess: (entries: number, lastItem?: R) => void;
  itemComponent: (props: PaginatedItemProps<R>) => JSX.Element;
  pageComponent: (props: PageComponentProps<R>) => JSX.Element;
  prevItem?: R;
}) {
  const memoizedParams = useMemo(
    () => props.params,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(props.params)],
  );

  const arg: PaginatedQueryArg<P> = {
    ...memoizedParams,
    page: props.pageNum,
    perPage: PER_PAGE,
  };

  const query = props.endpoint.useQuery(arg as any);

  const { onSuccess } = props;

  useEffect(() => {
    if (!query.isSuccess) return;
    onSuccess(query.data.length, query.data.at(-1));
  }, [query, onSuccess]);

  if (query.isLoading || query.isUninitialized)
    return <props.itemComponent loading />;

  if (query.isError) return <QueryErrorMessage query={query} />;

  return (
    <>
      <props.pageComponent
        itemComponent={props.itemComponent}
        response={query.data}
        prevItem={props.prevItem}
      />
      {query.data.length < PER_PAGE && <ExhaustedDataCard />}
    </>
  );
}

export function InfiniteScroll<
  B extends BaseQueryFn,
  T extends string,
  R,
  P extends {},
>(props: {
  params: P;
  endpoint: PaginatedQueryEndpoint<B, T, R, P>;
  reference: MutableRefObject<HTMLDivElement | null>;
  itemComponent: (props: PaginatedItemProps<R>) => JSX.Element;
  pageComponent: (props: PageComponentProps<R>) => JSX.Element;
}) {
  const pages = useStack<PageData<R>>([{ success: false }]);
  const lastPage = pages.peek();

  useEffect(() => {
    const ref = props.reference.current;

    function handleScroll(event: Event) {
      if (!lastPage.success || lastPage.entries < PER_PAGE) return;

      const target = event.target as HTMLDivElement;
      const { clientHeight, scrollTop } = target;
      const scrollBottom = target.scrollHeight - clientHeight - scrollTop;
      if (scrollBottom <= RATE * clientHeight) {
        pages.push({ success: false });
      }
    }
    if (ref) ref.addEventListener("scroll", handleScroll);

    return () => ref?.removeEventListener("scroll", handleScroll);
  }, [lastPage.success]);

  useEffect(() => {
    pages.clear();
    pages.push({ success: false });
  }, [JSON.stringify(props.params)]);

  const handleSuccess = useCallback((entries: number, lastItem?: R) => {
    pages.pop();
    pages.push({ success: true, entries, lastItem });
  }, []);

  return (
    <>
      {pages.stack.map((page, idx) => {
        const prevPage = idx !== 0 ? pages.stack[idx - 1] : undefined;
        return (
          <PageContainer
            key={idx}
            pageNum={idx}
            endpoint={props.endpoint}
            params={props.params}
            onSuccess={handleSuccess}
            itemComponent={props.itemComponent}
            pageComponent={props.pageComponent}
            prevItem={
              prevPage && prevPage.success ? prevPage.lastItem : undefined
            }
          />
        );
      })}
    </>
  );
}

const InfiniteScrollSimple = <
  B extends BaseQueryFn,
  T extends string,
  R extends {},
  P extends {},
>(props: {
  params: P;
  endpoint: PaginatedQueryEndpoint<B, T, R, P>;
  itemComponent: (props: PaginatedItemProps<R>) => JSX.Element;
  reference: MutableRefObject<HTMLDivElement | null>;
}) => <InfiniteScroll {...props} pageComponent={SimplePageComponent} />;

const InfiniteScrollByTimestamp = <
  B extends BaseQueryFn,
  T extends string,
  R extends { timestamp: Date },
  P extends {},
>(props: {
  params: P;
  endpoint: PaginatedQueryEndpoint<B, T, R, P>;
  itemComponent: (props: PaginatedItemProps<R>) => JSX.Element;
  reference: MutableRefObject<HTMLDivElement | null>;
}) => <InfiniteScroll {...props} pageComponent={ByTimestampPageComponent} />;

InfiniteScroll.Simple = InfiniteScrollSimple;
InfiniteScroll.ByTimestamp = InfiniteScrollByTimestamp;
