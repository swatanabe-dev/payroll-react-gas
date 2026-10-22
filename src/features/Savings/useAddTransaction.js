import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { addSavingsTransaction as addSavingsTransactionApi } from "../../services/apiSavings";
import { useParams } from "react-router-dom";

export function useAddTransaction() {
  const queryClient = useQueryClient();
  const { userId } = useParams();

  const { mutate: addSavingsTransaction, isPending: isAdding } = useMutation({
    mutationFn: addSavingsTransactionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings", userId] });
      toast.success("Completed!");
    },
    onError: (err) => {
      console.error(err.message);
      toast.error("Failed to add.");
    },
  });
  return { isAdding, addSavingsTransaction };
}
