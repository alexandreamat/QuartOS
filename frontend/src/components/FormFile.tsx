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
import { Form, InputOnChangeData, SemanticICONS } from "semantic-ui-react";
import { capitaliseFirstLetter } from "utils/string";

export default function FormFile(props: {
  label?: string;
  field: ReturnType<typeof useFormField<string>>;
  type?: string;
  icon?: SemanticICONS;
}) {
  const label = props.label || props.field.label;

  function handleFileChange(file: File) {
    const reader = new FileReader();
    // called once conversion is done
    reader.onloadend = () => {
      if (typeof reader.result !== "string") return;
      // strip "data:*/*;base64,""
      props.field.set(reader.result.split(";base64,")[1]);
    };
    reader.readAsDataURL(file); // convert to base64
  }
  return (
    <Form.Input
      icon={props.icon}
      type="file"
      label={label && capitaliseFirstLetter(label)}
      placeholder={label && "Enter " + label.toLocaleLowerCase()}
      onChange={(
        e: React.ChangeEvent<HTMLInputElement>,
        data: InputOnChangeData,
      ) => {
        if (!e.target.files) return;
        props.field.reset();
        handleFileChange(e.target.files[0]);
      }}
      error={props.field.isError}
    />
  );
}
