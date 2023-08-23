import { SkipToken, skipToken } from "@reduxjs/toolkit/dist/query";
import { SimpleDataQuery } from "interfaces";
import { useEffect, useMemo, useRef, useState } from "react";

type UseLazyQueryTrigger<Arg, Ret> = (
  arg: Arg,
  preferCacheValue: boolean
) => {
  unwrap: () => Promise<Ret[]>;
};

type UseLazyQueryLastPromiseInfo<Arg> = {
  lastArg: Arg;
};

type UseLazyQuery<Arg, Ret> = () => [
  UseLazyQueryTrigger<Arg, Ret>,
  SimpleDataQuery<Ret>,
  UseLazyQueryLastPromiseInfo<Arg>
];

const RATE = 1;

export function useInfiniteQuery<Arg, Ret>(
  useLazyQuery: UseLazyQuery<Arg, Ret>,
  params: Arg | SkipToken,
  perPage: number,
  onMutation?: (x: Ret) => void
) {
  const jsonParams = JSON.stringify(params);
  const memoizedParams = useMemo(() => params, [jsonParams]);

  const reference = useRef<HTMLDivElement | null>(null);

  const [page, setPage] = useState(0);
  const [pages, setPages] = useState<Record<number, Ret[]>>({});
  const [resetKey, setResetKey] = useState(0);
  const [isExhausted, setIsExhausted] = useState(false);
  const isLocked = useRef(false);

  const [trigger, result] = useLazyQuery();

  const handleMutation = (item: Ret) => {
    if (onMutation) onMutation(item);
    setResetKey((x) => x + 1);
  };

  const handleReset = () => {
    setPages({});
    setIsExhausted(false);
    isLocked.current = true;
    setPage(0);
  };

  useEffect(() => handleReset(), [resetKey]);

  useEffect(() => {
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLDivElement;
      const clientHeight = target.clientHeight;
      const scrollTop = target.scrollTop;
      const scrollBottom = target.scrollHeight - clientHeight - scrollTop;
      if (isLocked.current || isExhausted) return;
      if (scrollBottom <= RATE * clientHeight) {
        isLocked.current = true;
        setPage((prevPage) => prevPage + 1);
      }
    };
    const scrollContainer = reference.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (scrollContainer)
        scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [isExhausted]);

  useEffect(() => {
    async function cb() {
      if (memoizedParams === skipToken) return;
      try {
        const data = await trigger(
          {
            ...memoizedParams,
            page,
            perPage,
          },
          true
        ).unwrap();
        if (data!.length === 0) {
          setIsExhausted(true);
        } else {
          setPages((prevTransactions) => ({
            ...prevTransactions,
            [page]: data!,
          }));
        }
        setTimeout(() => (isLocked.current = false), 300);
      } catch (error) {
        return;
      }
    }
    cb();
  }, [page, perPage, memoizedParams, trigger]);

  if (result.isError) console.error(result.originalArgs);

  return {
    reference,
    page,
    pages,
    reset: handleReset,
    mutate: handleMutation,
    isError: result.isError,
    isLoading: result.isLoading,
    isSuccess: result.isSuccess,
    isFetching: result.isFetching,
    isExhausted,
    originalArgs: result.originalArgs,
    error: result.error,
  };
}
