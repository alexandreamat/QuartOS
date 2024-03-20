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
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Divider } from "semantic-ui-react";
import {
  PaginatedItemProps,
  PaginatedQueryArg,
  PaginatedQueryEndpoint,
} from "types";

const PER_PAGE = 20;
const RATE = 1;

function Page<
  B extends BaseQueryFn,
  T extends string,
  R extends { timestamp: Date },
  P,
>(props: {
  pageNum: number;
  params: P;
  endpoint: PaginatedQueryEndpoint<B, T, R, P>;
  onSuccess: (entries: number, lastTimestamp?: Date) => void;
  itemComponent: (props: PaginatedItemProps<R>) => JSX.Element;
  prevTimestamp?: Date;
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
    onSuccess(query.data.length, query.data.at(-1)?.timestamp);
  }, [query, onSuccess]);

  if (query.isLoading || query.isUninitialized)
    return <props.itemComponent loading />;
  if (query.isError) return <QueryErrorMessage query={query} />;

  const itemsByTimestamp =
    query.data &&
    query.data.reduce(
      (prev, item) => {
        const key = item.timestamp.getTime();
        const items = prev[key] ? [...prev[key].items, item] : [item];
        return {
          ...prev,
          [key]: {
            timestamp: item.timestamp,
            items,
          },
        };
      },
      {} as { [timestamp: number]: { timestamp: Date; items: R[] } },
    );

  // const itemsByDayMonthYear = query.data?.reduce(
  //   (acc, item) => {
  //     const timestamp = item.timestamp;
  //     const year = format(timestamp, "yyyy");
  //     const month = format(timestamp, "MMMM");
  //     const day = format(timestamp, "d");

  //     acc[year] = acc[year] || {};
  //     acc[year][month] = acc[year][month] || {};
  //     acc[year][month][day] = acc[year][month][day] || [];

  //     acc[year][month][day].push(item);
  //     return acc;
  //   },
  //   {} as { [year: string]: { [month: string]: { [day: string]: R[] } } },
  // );

  return (
    <>
      {/* {Object.entries(itemsByDayMonthYear).map(([year, months], i) => (
        <div key={i} style={{ width: "100%", position: "relative" }}>
          <div style={{ position: "sticky", top: 0, zIndex: 1 }}>
            <Divider horizontal>{year}</Divider>
          </div>
          {Object.entries(months).map(([month, days], j) => (
            <div key={j} style={{ width: "100%" }}>
              <div style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <Divider horizontal>{month}</Divider>
              </div>
              {Object.entries(days).map(([day, items], k) => (
                <div key={k} style={{ width: "100%" }}>
                  <div style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <Divider horizontal>{day}</Divider>
                  </div>
                  {items.map((item, l) => (
                    <props.itemComponent
                      key={`${i}.${j}.${k}.${l}`}
                      response={item}
                      loading={query.isFetching}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))} */}
      {Object.entries(itemsByTimestamp).map(
        ([time, { timestamp, items }], i) => {
          return (
            <div key={i} style={{ width: "100%" }}>
              {Number(time) !== props.prevTimestamp?.getTime() && (
                <>
                  <Divider horizontal>
                    {format(timestamp, "yyyy MMMM d")}
                  </Divider>
                </>
              )}
              {items.map((item, j) => (
                <props.itemComponent
                  key={`${i}.${j}`}
                  response={item}
                  loading={query.isFetching}
                />
              ))}
            </div>
          );
        },
      )}
      {query.data.length < PER_PAGE && <ExhaustedDataCard />}
    </>
  );
}

type PageData =
  | {
      success: false;
    }
  | {
      success: true;
      entries: number;
      lastTimestamp?: Date;
    };

export function GroupedInfiniteScroll<
  B extends BaseQueryFn,
  T extends string,
  R extends { timestamp: Date },
  P extends {},
>(props: {
  params: P;
  endpoint: PaginatedQueryEndpoint<B, T, R, P>;
  itemComponent: (props: PaginatedItemProps<R>) => JSX.Element;
  reference: MutableRefObject<HTMLDivElement | null>;
}) {
  const pages = useStack<PageData>([{ success: false }]);
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

  const handleSuccess = useCallback((entries: number, lastTimestamp?: Date) => {
    pages.pop();
    pages.push({ success: true, entries, lastTimestamp });
  }, []);

  return (
    <>
      {pages.stack.map((page, idx) => {
        const prevPage = idx !== 0 ? pages.stack[idx - 1] : undefined;
        return (
          <Page
            key={idx}
            pageNum={idx}
            endpoint={props.endpoint}
            params={props.params}
            onSuccess={handleSuccess}
            itemComponent={props.itemComponent}
            prevTimestamp={
              prevPage && prevPage.success ? prevPage.lastTimestamp : undefined
            }
          />
        );
      })}
    </>
  );
}
