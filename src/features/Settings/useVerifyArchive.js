import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { verifyArchive as verifyArchiveApi } from "../../services/apiArchives";

export function useVerifyArchive() {
  const queryClient = useQueryClient();

  const { mutate: verifyArchive, isPending: isVerifying } = useMutation({
    mutationFn: verifyArchiveApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archives"] });
      toast.success("Successfully verified!");
    },
    onError: (err) => {
      console.error(err.message);
      toast.error("Failed to verify.");
    },
  });

  return { verifyArchive, isVerifying };
}
