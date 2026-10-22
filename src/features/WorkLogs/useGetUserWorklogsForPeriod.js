import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { getUserWorklogsForPeriod } from "../../services/apiWorkLogs";

export function useGetUserWorklogsForPeriod(year, month) {
  const { userId } = useParams();

  const {
    data: userWorklogs = [],
    isPending,
    isError,
  } = useQuery({
    queryFn: () => getUserWorklogsForPeriod({ userId, year, month }),
    queryKey: ["worklogs_user_period", userId, year, month],
    staleTime: 60 * 1000 * 180,
    gcTime: 60 * 1000 * 190,
    // Only fetch if I actually have a userId, year, and month
    enabled: !!userId && !!year && !!month,
  });

  return { userWorklogs, isPending, isError };
}
