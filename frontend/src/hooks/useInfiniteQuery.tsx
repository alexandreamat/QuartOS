import { BaseQueryFn, SkipToken, skipToken } from "@reduxjs/toolkit/dist/query";
import { QueryHooks } from "@reduxjs/toolkit/dist/query/react/buildHooks";
import {
  QueryDefinition,
  UpdateDefinitions,
} from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiEndpointQuery } from "@reduxjs/toolkit/dist/query/core/module";

const RATE = 1;

export function useInfiniteQuery<B extends BaseQueryFn, T extends string, R, P>(
  endpoint: ApiEndpointQuery<
    QueryDefinition<P & { page?: number; perPage?: number }, B, T, R[]>,
    UpdateDefinitions<never, T, never>
  > &
    QueryHooks<
      QueryDefinition<P & { page?: number; perPage?: number }, B, T, R[]>
    >,
  params: P | SkipToken,
  perPage: number
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);

  const reference = useRef<HTMLDivElement | null>(null);
  const page = useRef(0);

  const [data, setData] = useState<R[]>([]);
  const [isUninitialized, setIsUninitialized] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isExhausted, setIsExhausted] = useState(false);
  const [error, setError] = useState<any>(undefined);

  const [fetchData] = endpoint.useLazyQuery();

  const appendPage = useCallback(
    async (page: number) => {
      if (memoizedParams === skipToken) {
        setData([]);
        setIsUninitialized(true);
        setIsLoading(false);
        setIsFetching(false);
        setIsExhausted(false);
        return false;
      }

      setIsFetching(true);
      setIsUninitialized(false);
      let cont = false;
      try {
        const data = await fetchData(
          {
            page,
            perPage,
            ...memoizedParams,
          } as any,
          true
        ).unwrap();
        if (data.length === 0) {
          setIsExhausted(true);
        } else {
          setData((prevData) => [...(page ? prevData : []), ...data]);
          cont = true;
        }
        setIsSuccess(true);
        setIsError(false);
        setError(undefined);
      } catch (error) {
        setIsSuccess(false);
        setIsError(true);
        setError(error);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
      return cont;
    },
    [fetchData, memoizedParams, perPage]
  );

  const handleMutation = useCallback(async () => {
    setData([]);
    for (let i = 0; i < page.current; i++) await appendPage(i);
  }, [appendPage]);

  useEffect(
    () => setIsLoading(isFetching && isUninitialized),
    [isUninitialized, isFetching]
  );

  useEffect(() => {
    const ref = reference.current;

    let isExhausted = false;
    let cancelled = false;

    async function appendNextPage() {
      if (isExhausted || cancelled) return;

      const cont = await appendPage(page.current);
      if (cancelled) return;
      if (cont) page.current++;
      else isExhausted = true;
    }

    let isScrollLocked = false;

    function handleScroll(event: Event) {
      if (isScrollLocked) return;

      const target = event.target as HTMLDivElement;
      const clientHeight = target.clientHeight;
      const scrollTop = target.scrollTop;
      const scrollBottom = target.scrollHeight - clientHeight - scrollTop;
      if (scrollBottom <= RATE * clientHeight) {
        isScrollLocked = true;
        appendNextPage().then(() => (isScrollLocked = false));
      }
    }

    appendNextPage().then(() => {
      if (!cancelled) ref?.addEventListener("scroll", handleScroll);
    });

    return () => {
      cancelled = true;
      if (ref) ref.scrollTop = 0;
      page.current = 0;
      setData([]);
      setIsUninitialized(true);
      setIsLoading(false);
      setIsFetching(false);
      setIsSuccess(false);
      setIsError(false);
      setIsExhausted(false);
      setError(undefined);
      ref?.removeEventListener("scroll", handleScroll);
    };
  }, [appendPage]);

  return {
    reference,
    data,
    onMutation: handleMutation,
    isUninitialized,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    isExhausted,
    error,
  };
}
