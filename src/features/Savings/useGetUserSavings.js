import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getUserSavings } from "../../services/apiSavings";

export function useGetUserSavings() {
  const { userId } = useParams();

  const {
    data = [],
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["savings", userId],
    queryFn: () => getUserSavings(userId),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  return { data, isPending, isError, error };
}
