import { ReactNode } from "react";
import { Button, Form, Modal } from "semantic-ui-react";

export default function FormModal(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: () => void;
}) {
  return (
    <Modal open={props.open} onClose={props.onClose} size="mini">
      <Modal.Header>{props.title}</Modal.Header>
      <Modal.Content>
        <Form>{props.children}</Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button
          content="Save"
          type="submit"
          labelPosition="right"
          icon="checkmark"
          onClick={props.onSubmit}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
}
