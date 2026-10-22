import { useQuery } from "@tanstack/react-query";
import { getMonthlyPrizeData } from "../../services/apiAttendanceMonthly";

export function useGetMonthlyPrizeData(fiscalYear, month) {
  const {
    data: prizeRecords = [],
    isPending,
    isError,
  } = useQuery({
    queryFn: () => getMonthlyPrizeData({ fiscalYear, month }),
    queryKey: ["prize_records", fiscalYear, month], // MEMO: fiscalYear & month may not be needed here as the period (FY) is FIXED, not Selectable.
    enabled: !!fiscalYear && !!month,
    staleTime: 60 * 1000 * 180, // No mutations invalidate. Stale every 3 hours
    gcTime: 60 * 1000 * 190,
  });
  return { prizeRecords, isPending, isError };
}
