import { useQuery } from "@tanstack/react-query";

import { getPayslipsForPeriod } from "../../services/apiPayslip";

export function useGetPayslipsForPeriod(year, month) {
  const {
    data = {},
    isPending,
    isError,
  } = useQuery({
    queryFn: () => getPayslipsForPeriod({ year, month }),
    queryKey: ["payslips_summaries", year, month],
    enabled: !!year && !!month,
    staleTime: Infinity, // useProcessMultiplePayslip invalidates this to refetch the data
    gcTime: Infinity,
  });
  return { data, isPending, isError };
}
