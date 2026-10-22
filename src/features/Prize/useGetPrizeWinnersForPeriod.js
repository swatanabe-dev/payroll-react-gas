import { useQuery } from "@tanstack/react-query";

import { getPrizeWinnersForPeriod } from "../../services/apiPayslip";

export function useGetPrizeWinnersForPeriod(fiscalYear, month) {
  const {
    data: winners = {},
    isPending,
    isError,
  } = useQuery({
    queryFn: () => getPrizeWinnersForPeriod({ fiscalYear, month }),
    queryKey: ["prize_winners", fiscalYear, month],
    enabled: !!fiscalYear && !!month,
    staleTime: 60 * 1000 * 180, // No mutations invalidate. Stale every 3 hours
    gcTime: 60 * 1000 * 190,
  });
  return { winners, isPending, isError };
}
