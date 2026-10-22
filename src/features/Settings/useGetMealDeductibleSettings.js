import { useQuery } from "@tanstack/react-query";

import { getMealDeductibleSettings } from "../../services/apiMealDeductible";

export function useGetMealDeductibleSettings() {
  const {
    data: mealDeductibleData,
    isPending: isFetchingMealDeductibles,
    isError,
    error,
  } = useQuery({
    queryKey: ["mealDeductibles"],
    queryFn: getMealDeductibleSettings,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
  return { mealDeductibleData, isFetchingMealDeductibles, isError, error };
}
