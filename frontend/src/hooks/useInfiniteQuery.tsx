import { BaseQueryFn, SkipToken, skipToken } from "@reduxjs/toolkit/dist/query";
import { UseLazyQuery } from "@reduxjs/toolkit/dist/query/react/buildHooks";
import { QueryDefinition } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const RATE = 1;

export function useInfiniteQuery<
  Q extends { page?: number; perPage?: number },
  B extends BaseQueryFn,
  T extends string,
  I,
  R extends Array<I>,
  P
>(
  useLazyQuery: UseLazyQuery<QueryDefinition<Q, B, T, R>>,
  params: P | SkipToken,
  perPage: number
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);

  const reference = useRef<HTMLDivElement | null>(null);
  const page = useRef(0);

  const [data, setData] = useState<Record<number, R>>({});
  const [isUninitialized, setIsUninitialized] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isExhausted, setIsExhausted] = useState(false);
  const [error, setError] = useState<any>(undefined);

  const [fetchData] = useLazyQuery();

  const handleMutation = useCallback((itemId: number) => {
    //
  }, []);

  const appendPage = useCallback(async () => {
    if (memoizedParams === skipToken) {
      setData({});
      setIsUninitialized(true);
      setIsLoading(false);
      setIsFetching(false);
      setIsExhausted(false);
      return;
    }

    setIsFetching(true);
    setIsUninitialized(false);
    try {
      const data = await fetchData(
        {
          page: page.current,
          perPage,
          ...memoizedParams,
        } as any,
        true
      ).unwrap();
      if (data.length === 0) {
        setIsExhausted(true);
      } else {
        setData((prevData) => ({
          ...prevData,
          [page.current++]: data,
        }));
        setIsSuccess(true);
        setIsError(false);
        setError(undefined);
      }
    } catch (error) {
      setIsSuccess(false);
      setIsError(true);
      setError(error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [fetchData, memoizedParams, perPage]);

  useEffect(
    () => setIsLoading(isFetching && isUninitialized),
    [isUninitialized, isFetching]
  );

  useEffect(() => {
    const ref = reference.current;

    setData({});
    setIsUninitialized(true);
    setIsLoading(false);
    setIsFetching(false);
    setIsSuccess(false);
    setIsError(false);
    setIsExhausted(false);
    setError(undefined);

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLDivElement;
      const clientHeight = target.clientHeight;
      const scrollTop = target.scrollTop;
      const scrollBottom = target.scrollHeight - clientHeight - scrollTop;
      if (isExhausted) return;
      if (scrollBottom <= RATE * clientHeight) {
        ref?.removeEventListener("scroll", handleScroll);
        appendPage().finally(() =>
          ref?.addEventListener("scroll", handleScroll)
        );
      }
    };

    appendPage().finally(() => ref?.addEventListener("scroll", handleScroll));

    return () => {
      ref?.removeEventListener("scroll", handleScroll);
    };
  }, [isExhausted, appendPage]);

  return {
    reference,
    data,
    mutate: handleMutation,
    isUninitialized,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    isExhausted,
    error,
  };
}
