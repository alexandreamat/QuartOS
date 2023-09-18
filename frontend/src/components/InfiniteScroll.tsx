import { MutableRefObject, useEffect, useMemo, useState } from "react";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import ExhaustedDataCard from "components/ExhaustedDataCard";
import { BaseQueryFn } from "@reduxjs/toolkit/dist/query";
import { PaginatedQueryArg, PaginatedQueryEndpoint } from "types";
import { PaginatedItemProps } from "types";

const PER_PAGE = 20;
const RATE = 1;

function Page<B extends BaseQueryFn, T extends string, R, P>(props: {
  page: number;
  params: P;
  endpoint: PaginatedQueryEndpoint<B, T, R, P>;
  onSuccess: (loadMore: boolean) => void;
  item: (props: PaginatedItemProps<R>) => JSX.Element;
}) {
  const memoizedParams = useMemo(
    () => props.params,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(props.params)],
  );

  const arg: PaginatedQueryArg<P> = {
    ...memoizedParams,
    page: props.page,
    perPage: PER_PAGE,
  };

  const query = props.endpoint.useQuery(arg as any);

  const { onSuccess: onLoadMore } = props;

  useEffect(() => {
    if (query.isSuccess) onLoadMore(query.data.length >= PER_PAGE);
  }, [query, onLoadMore]);

  if (query.isLoading || query.isUninitialized) return <props.item loading />;
  if (query.isError) return <QueryErrorMessage query={query} />;

  return (
    <>
      {query.data.map((response, i) => (
        <props.item key={i} response={response} loading={query.isFetching} />
      ))}
      {query.data.length < PER_PAGE && <ExhaustedDataCard />}
    </>
  );
}

export function InfiniteScroll<
  B extends BaseQueryFn,
  T extends string,
  R,
  P,
>(props: {
  params: P;
  endpoint: PaginatedQueryEndpoint<B, T, R, P>;
  itemRenderer: (props: PaginatedItemProps<R>) => JSX.Element;
  reference: MutableRefObject<HTMLDivElement | null>;
}) {
  const [pages, setPages] = useState(1);
  const [loadMore, setLoadMore] = useState(false);

  useEffect(() => {
    const ref = props.reference.current;

    function handleScroll(event: Event) {
      if (!loadMore) return;

      const target = event.target as HTMLDivElement;
      const { clientHeight, scrollTop } = target;
      const scrollBottom = target.scrollHeight - clientHeight - scrollTop;
      if (scrollBottom <= RATE * clientHeight) {
        setLoadMore(false);
        setPages((p) => p + 1);
      }
    }
    if (ref) ref.addEventListener("scroll", handleScroll);

    return () => ref?.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  useEffect(() => {
    setLoadMore(true);
    setPages(1);
  }, [props.params]);

  function handleSuccess(page: number, loadMore: boolean) {
    if (page !== pages - 1) return;
    setLoadMore(loadMore);
  }

  return (
    <>
      {Array.from({ length: pages }, (_, page) => (
        <Page
          key={page}
          page={page}
          endpoint={props.endpoint}
          params={props.params}
          onSuccess={(loadMore) => handleSuccess(page, loadMore)}
          item={props.itemRenderer}
        />
      ))}
    </>
  );
}
