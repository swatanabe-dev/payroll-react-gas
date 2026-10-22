import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { saveMealDeductibleSetting as saveMealDeductibleSettingApi } from "../../services/apiMealDeductible";

export function useSaveMealDeductibleSetting() {
  const queryClient = useQueryClient();

  const { mutate: saveMealDeductibleSetting, isPending: isSaving } =
    useMutation({
      mutationFn: saveMealDeductibleSettingApi,
      retry: false,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["mealDeductibles"] });
        toast.success("Saved!");
      },
      onError: (err) => {
        console.error(err.message);
        toast.error("Failed to save.。");
      },
    });
  return { isSaving, saveMealDeductibleSetting };
}
