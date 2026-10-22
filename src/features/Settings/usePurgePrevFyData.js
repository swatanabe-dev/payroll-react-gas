import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { purgePrevFyData as purgePrevFyDataApi } from "../../services/apiArchives";
import { useNavigate } from "react-router-dom";

export function usePurgePrevFyData() {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Initialize the client

  const { mutate: purgePrevFyData, isPending: isPurging } = useMutation({
    mutationFn: purgePrevFyDataApi,
    onSuccess: () => {
      toast.success(
        "Successfully purged! Reloading the page to update...",
        { duration: 1900 },
      );

      setTimeout(() => {
        // Below replicates `window.top.location.reload();` so that `isPending` kicks in
        queryClient.clear();
        navigate("/", { replace: true });
      }, 2000);
    },
    onError: (err) => {
      console.error(err.message || "An error occurred while purging data.");
      toast.error("Failed to complete purging.");
    },
  });

  return { purgePrevFyData, isPurging };
}
