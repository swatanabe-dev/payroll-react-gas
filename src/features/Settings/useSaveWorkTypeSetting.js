import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { saveWorkTypeSetting as saveWorkTypeSettingApi } from "../../services/apiWorkType";

export function useSaveWorkTypeSetting() {
  const queryClient = useQueryClient();

  const { mutate: saveWorkTypeSetting, isPending: isSaving } = useMutation({
    mutationFn: saveWorkTypeSettingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workTypes"] });
      toast.success("Saved!");
    },
    onError: (err) => {
      console.error(err.massage);
      toast.error("Failed to save.。");
    },
  });
  return { isSaving, saveWorkTypeSetting };
}
