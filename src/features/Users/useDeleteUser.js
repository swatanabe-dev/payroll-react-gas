import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { deleteUser as deleteUserApi } from "../../services/apiUsers";

export function useDeleteUser() {
  const queryClient = useQueryClient();

  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.refetchQueries({ queryKey: ["users"] });
      toast.success("Deleted!");
    },
    onError: (err) => {
      console.error(err.message);
      toast.error("Failed to delete.");
    },
  });

  return { isDeleting, deleteUser };
}
