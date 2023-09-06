import { Button, Icon } from "semantic-ui-react";

export default function UploadButton(props: {
  onUpload: (file: File) => void;
}) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) props.onUpload(file);
  };

  return (
    <>
      <Button as="label" htmlFor="file-input" primary icon labelPosition="left">
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
