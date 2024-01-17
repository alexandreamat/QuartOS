// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import useFormField from "hooks/useFormField";
import { useEffect, useRef } from "react";
import { Form, TextAreaProps } from "semantic-ui-react";

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
        data: TextAreaProps,
      ) => {
        props.field.reset();
        props.field.set(data.value as string);
      }}
      error={props.field.isError}
    />
  );
}
