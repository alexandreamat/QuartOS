import { api } from "app/services/api";
import { useEffect, useRef, useState } from "react";
import { BarState } from "./Bar";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import { TransactionCard } from "./TransactionCard";
import { Card } from "semantic-ui-react";
import { formatDateParam } from "utils/time";
import ExhaustedDataCard from "components/ExhaustedDataCard";
import { Checkboxes } from "hooks/useCheckboxes";
import FlexColumn from "components/FlexColumn";

const PER_PAGE = 20;
const RATE = 1;

function Page(props: {
  page: number;
  barState: BarState;
  isMultipleChoice?: boolean;
  checkboxes: Checkboxes;
  onSuccess: (loadMore: boolean) => void;
}) {
  const [search] = props.barState.search;
  const [timestampGe] = props.barState.timestampGe;
  const [timestampLe] = props.barState.timestampLe;
  const [isDescending] = props.barState.isDescending;
  const [amountGe] = props.barState.amountGe;
  const [amountLe] = props.barState.amountLe;
  const [isAmountAbs] = props.barState.isAmountAbs;
  const [accountId] = props.barState.accountId;

  const query = api.endpoints.readManyApiUsersMeTransactionsGet.useQuery({
    timestampGe: timestampGe && formatDateParam(timestampGe),
    timestampLe: timestampLe && formatDateParam(timestampLe),
    search,
    isDescending,
    amountGe,
    amountLe,
    isAmountAbs,
    accountId,
    page: props.page,
    perPage: PER_PAGE,
  });

  const { onSuccess: onLoadMore } = props;

  useEffect(() => {
    console.log(query);
    if (query.isSuccess) onLoadMore(query.data.length >= PER_PAGE);
  }, [query, onLoadMore]);

  if (query.isLoading) return <TransactionCard loading />;
  if (query.isError) return <QueryErrorMessage query={query} />;
  if (query.isUninitialized) return <></>;

  return (
    <>
      {query.data.map((t) => (
        <TransactionCard
          key={t.id}
          transaction={t}
          checked={props.checkboxes.checked.has(t.id)}
          onCheckedChange={
            props.isMultipleChoice
              ? (x) => props.checkboxes.onChange(t.id, x)
              : undefined
          }
        />
      ))}
      {query.data.length < PER_PAGE && <ExhaustedDataCard />}
    </>
  );
}

export default function TransactionCards(props: {
  barState: BarState;
  isMultipleChoice?: boolean;
  checkboxes: Checkboxes;
}) {
  const [pages, setPages] = useState(1);
  const [loadMore, setLoadMore] = useState(false);
  const reference = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ref = reference.current;

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
  }, [props.barState]);

  return (
    <FlexColumn.Auto reference={reference}>
      <Card.Group style={{ margin: 0, overflow: "hidden" }}>
        {Array.from({ length: pages }, (_, i) => (
          <Page
            key={i}
            page={i}
            checkboxes={props.checkboxes}
            isMultipleChoice={props.isMultipleChoice}
            barState={props.barState}
            onSuccess={setLoadMore}
          />
        ))}
      </Card.Group>
    </FlexColumn.Auto>
  );
}
