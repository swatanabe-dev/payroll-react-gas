import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { deleteMealDeductibleSetting as deleteMealDeductibleSettingApi } from "../../services/apiMealDeductible";

export function useDeleteMealDeductibleSetting() {
  const queryClient = useQueryClient();

  const { mutate: deleteMealDeductibleSetting, isPending: isDeleting } =
    useMutation({
      mutationFn: deleteMealDeductibleSettingApi,
      retry: false,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["mealDeductibles"] });
        toast.success("Deleted!");
      },
      onError: (err) => {
        console.error(err.message);
        toast.error("Failed to delete.");
      },
    });
  return { isDeleting, deleteMealDeductibleSetting };
}
