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
      onDragOver={(event: any) => event.preventDefault()}
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
