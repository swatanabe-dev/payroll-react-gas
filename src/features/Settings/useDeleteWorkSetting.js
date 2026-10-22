import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { deleteWorkTypeSetting as deleteWorkTypeSettingApi } from "../../services/apiWorkType";

export function useDeleteWorkTypeSetting() {
  const queryClient = useQueryClient();

  const { mutate: deleteWorkTypeSetting, isPending: isDeleting } = useMutation({
    mutationFn: deleteWorkTypeSettingApi,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["workTypes"] });
      toast.success("Deleted!");
    },
    onError: (err) => {
      console.error(err.message);
      toast.error("Failed to delete.");
    },
  });

  return { isDeleting, deleteWorkTypeSetting };
}
