import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { archiveFiscalYear as archiveFiscalYearApi } from "../../services/apiArchives";

export function useArchiveFiscalYear() {
  const queryClient = useQueryClient();

  const { mutate: archiveFiscalYear, isPending: isArchiving } = useMutation({
    mutationFn: archiveFiscalYearApi,
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["archives"] }),
        queryClient.invalidateQueries({
          queryKey: ["unarchived_fiscal_years"],
        }),
      ]);
      toast.success("Saved a copy!!");
    },
    onError: (err) => {
      console.error(err.message);
      toast.error("Failed to save a copy.");
    },
  });

  return { isArchiving, archiveFiscalYear };
}
