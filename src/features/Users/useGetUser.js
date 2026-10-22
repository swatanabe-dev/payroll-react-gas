import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { getUserDetails } from "../../services/apiUsers";

export function useGetUserDetails() {
  const { userId } = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["user_details", userId],
    queryFn: () => getUserDetails(userId),
    staleTime: Infinity, // never trigger a refetch until the Query is invalidated manually.
    gcTime: Infinity,
  });

  return { data, isPending, isError, error };
}
