import { useQuery } from "@tanstack/react-query";

import { getUnarchivedFiscalYears } from "../../services/apiWorkLogs";

export function useGetUnarchivedFiscalYears() {
  const {
    data = [],
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["unarchived_fiscal_years"],
    queryFn: getUnarchivedFiscalYears,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return { data, isPending, isError, error };
}
