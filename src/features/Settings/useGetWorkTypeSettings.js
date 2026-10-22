import { useQuery } from "@tanstack/react-query";

import { getWorkTypeSettings } from "../../services/apiWorkType";

export function useGetWorkTypeSettings() {
  const {
    data: workTypes,
    isPending: isFetchingWorkTypes,
    isError,
    error,
  } = useQuery({
    queryKey: ["workTypes"],
    queryFn: getWorkTypeSettings,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return { workTypes, isFetchingWorkTypes, isError, error };
}
