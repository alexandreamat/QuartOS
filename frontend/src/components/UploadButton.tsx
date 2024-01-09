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

import { Button, Icon } from "semantic-ui-react";

export default function UploadButton(props: {
  onUpload: (file: File) => void;
  loading?: boolean;
  negative?: boolean;
  disabled?: boolean;
}) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) props.onUpload(file);
  };

  return (
    <>
      <Button
        as="label"
        htmlFor="file-input"
        primary
        icon
        labelPosition="left"
        disabled={props.disabled}
        loading={props.loading}
        negative={props.negative}
      >
        <Icon name="cloud upload" />
        Upload
      </Button>
      <input
        type="file"
        id="file-input"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
}
