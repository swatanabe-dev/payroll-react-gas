import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteWorkLog as deleteWorkLogApi } from "../../services/apiWorkLogs";

export function useDeleteWorkLog() {
  const queryClient = useQueryClient();

  const { mutate: deleteWorkLog, isPending: isDeleting } = useMutation({
    mutationFn: deleteWorkLogApi,
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["worklogs"] }),
        queryClient.refetchQueries({
          queryKey: ["payslip_periods"],
        }),
      ]);
      toast.success("Deleted!");
    },
    onError: (err) => {
      console.error(err.message);
      toast.error("Failed to delete.");
    },
  });

  return { isDeleting, deleteWorkLog };
}
