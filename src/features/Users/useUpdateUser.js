import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { updateUser as updateUserApi } from "../../services/apiUsers";
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { userId } = useParams();

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: updateUserApi,
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user_details", userId] }),
        queryClient.refetchQueries({
          queryKey: ["users"],
        }),
      ]);

      toast.success("Updated!");
    },
    onError: (err) => {
      console.error(err.message);
      toast.error("Failed to update.");
    },
  });

  return { isUpdating, updateUser };
}
