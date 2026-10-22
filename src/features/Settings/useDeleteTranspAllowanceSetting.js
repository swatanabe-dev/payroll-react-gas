import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { deleteTranspAllowanceSetting as deleteTranspAllowanceSettingApi } from "../../services/apiTranspAllowance";

export function useDeleteTranspAllowanceSetting() {
  const queryClient = useQueryClient();

  const { mutate: deleteTranspAllowanceSetting, isPending: isDeleting } =
    useMutation({
      mutationFn: deleteTranspAllowanceSettingApi,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["transpAllowance"] });
        toast.success("Deleted!");
      },
      onError: (err) => {
        console.error(err.message);
        toast.error("Failed to delete.");
      },
    });

  return { isDeleting, deleteTranspAllowanceSetting };
}
