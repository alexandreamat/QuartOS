import { Popup } from "semantic-ui-react";

export default function LimitedText(props: { str: string; maxLength: number }) {
  if (props.str.length <= props.maxLength) return <p>{props.str}</p>;

  const sideLength = props.maxLength / 2;
  const beginning = props.str.substring(0, sideLength);
  const end = props.str.substring(
    props.str.length - sideLength,
    props.str.length
  );

  return (
    <Popup
      flowing
      content={props.str}
      trigger={
        <p>
          {beginning} ... {end}
        </p>
      }
    />
  );
}
