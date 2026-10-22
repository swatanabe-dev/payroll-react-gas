import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { updateSavings as updateSavingsApi } from "../../services/apiSavings";

export function useUpdateSavings() {
  const queryClient = useQueryClient();
  const { userId } = useParams();

  const { mutate: updateSavings, isPending: isUpdating } = useMutation({
    mutationFn: updateSavingsApi, // Tanstack query passes params. So this is okay too

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings", userId] });
      toast.success("Updated!");
    },

    onError: (err) => {
      console.error(err.message);
      toast.error("Failed to update.");
    },
  });

  return { isUpdating, updateSavings };
}
