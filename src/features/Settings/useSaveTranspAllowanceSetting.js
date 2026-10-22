import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { saveTranspAllowanceSetting as saveTranspAllowanceSettingApi } from "../../services/apiTranspAllowance";

export function useSaveTranspAllowanceSetting() {
  const queryClient = useQueryClient();

  const { mutate: saveTranspAllowanceSetting, isPending: isSaving } =
    useMutation({
      mutationFn: saveTranspAllowanceSettingApi,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["transpAllowance"] });
        toast.success("Saved!");
      },
      onError: (err) => {
        console.error(err.message);
        toast.error("Failed to save.。");
      },
    });
  return { isSaving, saveTranspAllowanceSetting };
}
