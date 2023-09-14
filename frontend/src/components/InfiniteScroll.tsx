import { MutableRefObject, useEffect, useMemo, useState } from "react";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { TransactionCard } from "../features/transaction/components/TransactionCard";
import ExhaustedDataCard from "components/ExhaustedDataCard";
import { BaseQueryFn } from "@reduxjs/toolkit/dist/query";
import { PaginatedQueryArg, PaginatedQueryEndpoint } from "types";

const PER_PAGE = 20;
const RATE = 1;

function Page<B extends BaseQueryFn, T extends string, R, P>(props: {
  page: number;
  params: P;
  endpoint: PaginatedQueryEndpoint<B, T, R, P>;
  onSuccess: (loadMore: boolean) => void;
  item: (props: { response: R }) => JSX.Element;
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

  if (query.isLoading) return <TransactionCard loading />;
  if (query.isError) return <QueryErrorMessage query={query} />;
  if (query.isUninitialized) return <></>;

  return (
    <>
      {query.data.map((response) => (
        <props.item response={response} />
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
  item: (props: { response: any }) => JSX.Element;
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

  return (
    <>
      {Array.from({ length: pages }, (_, i) => (
        <Page
          key={i}
          page={i}
          endpoint={props.endpoint}
          params={props.params}
          onSuccess={setLoadMore}
          item={props.item}
        />
      ))}
    </>
  );
}
