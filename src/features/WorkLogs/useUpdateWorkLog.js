import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { updateWorkLog as updateWorkLogApi } from "../../services/apiWorkLogs";

export function useUpdateWorkLog() {
  const queryClient = useQueryClient();

  const { mutate: updateWorkLog, isPending: isUpdating } = useMutation({
    mutationFn: updateWorkLogApi, // Tanstack query passes params. So this is okay too

    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["worklogs"] }),
        queryClient.refetchQueries({
          queryKey: ["payslip_periods"],
        }),
      ]);
      toast.success("Updated!");
    },

    onError: (err) => {
      console.error(err.message);
      toast.error("Failed to update.");
    },
  });

  return { isUpdating, updateWorkLog };
}
