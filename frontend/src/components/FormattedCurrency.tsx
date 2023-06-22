export function FormattedCurrency(props: {
  amount: number;
  currencyCode: string;
}) {
  return (
    <p>
      {props.amount.toLocaleString(undefined, {
        style: "currency",
        currency: props.currencyCode,
      })}
    </p>
  );
}
