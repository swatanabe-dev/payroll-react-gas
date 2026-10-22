import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { deleteHourlyWageSetting as deleteHourlyWageSettingApi } from "../../services/apiHourlyWage";

export function useDeleteHourlyWageSetting() {
  const queryClient = useQueryClient();

  const { mutate: deleteHourlyWageSetting, isPending: isDeleting } =
    useMutation({
      mutationFn: deleteHourlyWageSettingApi,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["hourlyWages"] });
        toast.success("Deleted!");
      },
      onError: (err) => {
        console.error(err.message);
        toast.error("Failed to delete.");
      },
    });

  return { deleteHourlyWageSetting, isDeleting };
}
