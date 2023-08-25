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

  const appendPage = useCallback(
    async (page: number) => {
      if (memoizedParams === skipToken) {
        setData({});
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
          setData((prevData) => ({
            ...prevData,
            [page]: data,
          }));
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

    let page = 0;
    let isExhausted = false;

    async function appendNextPage() {
      if (isExhausted) return;

      appendPage(page).then((cont) => {
        if (cont) page++;
        else isExhausted = true;
      });
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

    appendNextPage().then(() => ref?.addEventListener("scroll", handleScroll));

    return () => ref?.removeEventListener("scroll", handleScroll);
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
