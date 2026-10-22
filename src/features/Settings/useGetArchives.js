import { useQuery } from "@tanstack/react-query";
import { getArchives } from "../../services/apiArchives";

export function useGetArchives() {
  const {
    data = [],
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["archives"],
    queryFn: getArchives,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return { data, isPending, isError, error };
}
