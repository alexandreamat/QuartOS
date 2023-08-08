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
  const isLocked = useRef(false);

  const query = useQuery({ ...params, page, perPage });

  const handleMutation = (item: T) => {
    if (onMutation) onMutation(item);
    setResetKey((x) => x + 1);
  };

  const handleReset = () => {
    setPages({});
    setPage(0);
  };

  useEffect(() => handleReset(), [resetKey]);

  useEffect(() => {
    const handleScroll = (event: Event) => {
      if (isLocked.current) return;
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
  }, []);

  useEffect(() => {
    if (!query.data) return;
    setPages((prevTransactions) => ({
      ...prevTransactions,
      [page]: query.data!,
    }));
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
    originalArgs: query.originalArgs,
    error: query.error,
  };
}
