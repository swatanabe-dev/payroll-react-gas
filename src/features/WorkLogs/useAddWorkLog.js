import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { addWorkLog as addWorkLogApi } from "../../services/apiWorkLogs";
export function useAddWorkLog() {
  const queryClient = useQueryClient();

  const { mutate: addWorkLog, isPending: isAdding } = useMutation({
    mutationFn: addWorkLogApi,
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["worklogs"] }),
        queryClient.refetchQueries({
          queryKey: ["payslip_periods"],
        }),
      ]);
      toast.success("Completed!");
    },
    onError: (err) => {
      console.error(err.message);
      toast.error("Failed to save.");
    },
  });

  return { isAdding, addWorkLog };
}
