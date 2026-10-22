import { useQuery } from "@tanstack/react-query";

import { getHourlyWageSettings } from "../../services/apiHourlyWage";

export function useGetHourlyWageSettings() {
  const {
    data: hourlyWages,
    isPending: isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["hourlyWages"],
    queryFn: getHourlyWageSettings,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  return { hourlyWages, isFetching, isError, error };
}
