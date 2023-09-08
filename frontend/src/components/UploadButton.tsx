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
