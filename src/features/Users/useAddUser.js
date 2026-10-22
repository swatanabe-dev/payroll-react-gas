import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { addUser as addUserApi } from "../../services/apiUsers";
export function useAddUser() {
  const queryClient = useQueryClient();

  const { mutate: addUser, isPending: isAdding } = useMutation({
    mutationFn: addUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Completed!");
    },
    onError: (err) => {
      console.error(err.message);
      toast.error("Failed to save.");
    },
  });

  return { isAdding, addUser };
}
