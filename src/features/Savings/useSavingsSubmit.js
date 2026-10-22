import { useParams } from "react-router-dom";
import { useModal } from "../../contexts/ModalContext";
import { useAddTransaction } from "./useAddTransaction";
import { useUpdateSavings } from "./useUpdateSavings";

export function useSavingsSubmit({ mode, reset }) {

  const { userId } = useParams();

  const { addSavingsTransaction, isAdding } = useAddTransaction();
  const { updateSavings, isUpdating } = useUpdateSavings();
  const { closeModal } = useModal();

  const isProcessing = isAdding || isUpdating;

  // NOTE: formData for the "add" mode does not come with "userId". 
  function submit(formData) {
    if (mode === "add") {
      addSavingsTransaction(
        { ...formData, userId: userId },
        {
          onSettled: () => {
            reset();
            // closeModal();// Uncomment if appropriate
          },
        },
      );
    }

    if (mode === "edit") {
      updateSavings(formData, {
        onSettled: () => {
          reset();
          closeModal();
        },
      });
    }
  }
  return { submit, isProcessing };
}
