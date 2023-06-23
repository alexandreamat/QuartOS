export function FormattedCurrency(props: {
  amount: number;
  currencyCode: string;
}) {
  return (
    <>
      {props.amount.toLocaleString(undefined, {
        style: "currency",
        currency: props.currencyCode,
      })}
    </>
  );
}
