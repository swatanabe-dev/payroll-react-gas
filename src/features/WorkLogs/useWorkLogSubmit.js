import { useModal } from "../../contexts/ModalContext";
import { useAddWorkLog } from "./useAddWorkLog";
import { useUpdateWorkLog } from "./useUpdateWorkLog";

export function useWorkLogSubmit({ mode, logToEdit, reset }) {
  const { addWorkLog, isAdding } = useAddWorkLog();
  const { updateWorkLog, isUpdating } = useUpdateWorkLog();
  const { closeModal } = useModal();

  const isProcessing = isAdding || isUpdating;

  function submit(formData) {
    const { userInfo, ...rest } = formData;
    const { userId, name } = JSON.parse(userInfo);

    const payload = {
      ...rest,
      userId,
      name,
      adjustments: JSON.stringify(formData.adjustments || []),
    };

    if (mode === "add") {
      addWorkLog(payload, { onSettled: () => reset() });
    }

    if (mode === "edit") {
      updateWorkLog(
        { workLogId: logToEdit.workLogId, ...payload },
        {
          onSettled: () => {
            reset();
            closeModal();
          },
        },
      );
    }
  }

  return { submit, isProcessing };
}
