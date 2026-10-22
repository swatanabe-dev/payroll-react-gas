import { useQuery } from "@tanstack/react-query";

import { getUsers } from "../../services/apiUsers";

export function useGetUsers() {
  const {
    data = [],
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return { data, isPending, isError, error };
}
