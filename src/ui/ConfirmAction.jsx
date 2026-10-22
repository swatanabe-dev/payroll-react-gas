import Button from "./Button";
import Heading from "./Heading";
import Loading from "./Loading";
import "./ConfirmAction.css";

function ConfirmAction({ onCancel, onConfirm, isProcessing }) {
  function onDelete() {
    onConfirm();
    // onCancel();
  }

  return (
    <div className="action-confirmation">
      {isProcessing ? (
        <Loading type="stack-sm">Deleting...</Loading>
      ) : (
        <>
          <Heading type="h3">Are you sure to delete this?</Heading>
          <p className="confirmation-message">
            This action is<span>PERMANENT</span> and the data is{" "}
            <span>UNRECOVERABLE</span>.
          </p>
          <div className="confirm-buttons">
            <Button
              buttonStyle="confirm"
              buttonRadius="square"
              onClickFunction={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              buttonStyle="delete"
              buttonRadius="square"
              className="confirm-delete-button"
              onClickFunction={onDelete}
              disabled={isProcessing}
            >
              Delete
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default ConfirmAction;
