// Copyright (C) 2023 Alexandre Amat
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

import { Header, Icon, Segment } from "semantic-ui-react";
import UploadButton from "./UploadButton";

export default function UploadSegment(props: { onUpload: (x: File) => void }) {
  function handleFileDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) props.onUpload(file);
  }

  return (
    <Segment
      placeholder
      onDrop={handleFileDrop}
      onDragOver={(e: DragEvent) => e.preventDefault()}
      style={{ height: "100%" }}
    >
      <Header icon>
        <Icon name="file excel outline" />
        Upload your Transactions Sheet File
      </Header>
      <UploadButton onUpload={props.onUpload} />
    </Segment>
  );
}
