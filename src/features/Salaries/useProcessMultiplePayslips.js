import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { processMultiplePayslips } from "../../services/apiPayslip";

export function useProcessMultiplePayslips() {
  const queryClient = useQueryClient();

  const { mutateAsync: generatePayslipsData, isPending: isGenerating } =
    useMutation({
      // TanStack Query passes the { userIds, year, month } object directly into this function
      mutationFn: processMultiplePayslips,

      // The 2nd argument is "variables" to invalidate the cache
      onSuccess: async (data, { year, month }) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["payslips_summaries", year, month],
          }),
          queryClient.invalidateQueries({
            queryKey: ["payslip_periods"],
          }),
          queryClient.refetchQueries({
            queryKey: ["prize_winners"],
          }),
          queryClient.refetchQueries({
            queryKey: ["prize_records"],
          }),
        ]);
        toast.success("Successfully updated!");
      },
      onError: (err) => {
        toast.error("Failed to calculate/update pay stub data.");
        console.error(
          "Mmm, pay stub data could not be processed.",
          err.message,
        );
      },
    });
  return { isGenerating, generatePayslipsData };
}
