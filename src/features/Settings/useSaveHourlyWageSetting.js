import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { saveHourlyWageSetting as saveHourlyWageSettingApi } from "../../services/apiHourlyWage";

export function useSaveHourlyWageSetting() {
  const queryClient = useQueryClient();

  const { mutate: saveHourlyWageSetting, isPending: isSaving } = useMutation({
    mutationFn: saveHourlyWageSettingApi,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hourlyWages"] });
      toast.success("Saved!");
    },
    onError: (err) => {
      console.error(err.message);
      toast.error("Failed to save.。");
    },
  });

  return { isSaving, saveHourlyWageSetting };
}
