import useFormField from "hooks/useFormField";
import { Form, TextAreaProps } from "semantic-ui-react";
import { useEffect, useRef } from "react";

export default function FormTextArea(props: {
  label: string;
  field: ReturnType<typeof useFormField<string>>;
  type?: string;
  readOnly?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [props.field.value]);

  return (
    <Form.TextArea
      ref={textareaRef}
      readOnly={props.readOnly}
      type={props.type}
      label={props.label}
      placeholder={"Enter " + props.label.toLocaleLowerCase()}
      required={!props.readOnly}
      value={props.field.value}
      onChange={(
        event: React.ChangeEvent<HTMLTextAreaElement>,
        data: TextAreaProps
      ) => {
        props.field.reset();
        props.field.set(data.value as string);
      }}
      error={props.field.isError}
    />
  );
}
