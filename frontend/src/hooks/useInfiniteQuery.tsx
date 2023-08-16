import { SimpleDataQuery } from "interfaces";
import { useEffect, useRef, useState } from "react";

type UseQuery<T, U> = (x: U) => SimpleDataQuery<T>;

export function useInfiniteQuery<T, U>(
  useQuery: UseQuery<T, U>,
  params: U,
  perPage: number,
  onMutation?: (x: T) => void
) {
  const reference = useRef<HTMLDivElement | null>(null);

  const [page, setPage] = useState(0);
  const [pages, setPages] = useState<Record<number, T[]>>({});
  const [resetKey, setResetKey] = useState(0);
  const [isExhausted, setIsExhausted] = useState(false);
  const isLocked = useRef(false);

  const query = useQuery({ ...params, page, perPage });

  const handleMutation = (item: T) => {
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
      if (isLocked.current) return;
      if (isExhausted) return;
      const target = event.target as HTMLDivElement;
      if (target.scrollHeight - target.scrollTop < 1.5 * target.clientHeight) {
        isLocked.current = true;
        setPage((prevPage) => prevPage + 1);
      }
    };
    const scrollContainer = reference.current;

    if (scrollContainer)
      scrollContainer.addEventListener("scroll", handleScroll);

    return () => {
      if (scrollContainer)
        scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [isExhausted]);

  useEffect(() => {
    if (!query.isSuccess) return;
    if (query.data!.length === 0) {
      setIsExhausted(true);
    } else {
      setPages((prevTransactions) => ({
        ...prevTransactions,
        [page]: query.data!,
      }));
    }
    isLocked.current = false;
  }, [query.data]);

  if (query.isError) console.error(query.originalArgs);

  return {
    reference,
    page,
    pages,
    reset: handleReset,
    mutate: handleMutation,
    isError: query.isError,
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
    isExhausted,
    originalArgs: query.originalArgs,
    error: query.error,
  };
}
