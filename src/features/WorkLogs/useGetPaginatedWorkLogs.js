import { useSearchParams } from "react-router-dom";
import { useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query";

import { getPaginatedWorkLogs } from "../../services/apiWorkLogs";
import { LOGS_PER_PAGE } from "../../utils/constants";
import { useEffect } from "react";

export function useGetPaginatedWorkLogs() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const category = searchParams.get("category") || null;
  const searchWord = searchParams.get("searchWord") || null;

  const currentQueryKey = ["worklogs", page, category, searchWord];

  const {
    data: { worklogs, count } = {},
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: currentQueryKey,
    queryFn: () => getPaginatedWorkLogs(page, category, searchWord),
    staleTime: 60 * 1000 * 15,
    gcTime: 60 * 1000 * 20,
  });

  const pageCount = Math.ceil((count || 0) / LOGS_PER_PAGE);

  // exact: true ensures we don't accidentally match broader keys
  const isPrefetchingNext =
    useIsFetching({
      queryKey: ["worklogs", page + 1, category, searchWord],
      exact: true,
    }) > 0;
  const isPrefetchingPrev =
    useIsFetching({
      queryKey: ["worklogs", page - 1, category, searchWord],
      exact: true,
    }) > 0;

  // Refer to the official tanstack doc for use of useEffect
  useEffect(() => {
    if (page < pageCount) {
      queryClient.prefetchQuery({
        queryKey: ["worklogs", page + 1, category, searchWord],
        queryFn: () => getPaginatedWorkLogs(page + 1, category, searchWord),
      });
    }

    if (page > 1) {
      queryClient.prefetchQuery({
        queryKey: ["worklogs", page - 1, category, searchWord],
        queryFn: () => getPaginatedWorkLogs(page - 1, category, searchWord),
      });
    }
  }, [page, pageCount, category, searchWord, queryClient]);

  return {
    worklogs,
    count,
    isPending,
    isError,
    error,
    isPrefetchingPrev,
    isPrefetchingNext,
  };
}
