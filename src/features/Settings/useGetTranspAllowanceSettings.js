import { useQuery } from "@tanstack/react-query";

import { getTranspAllowanceSettings } from "../../services/apiTranspAllowance";
export function useGetTranspAllowanceSettings() {
  const {
    data: transpAllowanceData,
    isPending: isFetchingTranspAllowanceData,
    isError,
    error,
  } = useQuery({
    queryKey: ["transpAllowance"],
    queryFn: getTranspAllowanceSettings,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
  return { transpAllowanceData, isFetchingTranspAllowanceData, isError, error };
}
