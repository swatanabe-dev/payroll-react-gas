import { useQuery } from "@tanstack/react-query";

import { getAvailablePayslipPeriods } from "../../services/apiPayslip";

export function useGetAvailablePayslipPeriods() {
  const {
    data: periods = [],
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["payslip_periods"],
    queryFn: getAvailablePayslipPeriods,
    staleTime: Infinity, // useProcessMultiple..., useAdd/Update/DeleteWorkLogs - these 4 functions invalidate this
    gcTime: Infinity,
  });
  return { periods, isPending, isError, error };
}
