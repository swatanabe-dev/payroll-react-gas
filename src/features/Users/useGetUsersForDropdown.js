import { useQuery } from "@tanstack/react-query";
import { getUsersForDropdown } from "../../services/apiUsers";

export function useGetUsersForDropdown() {
  const {
    data: dropdownUsers,
    isPending: isFetchingUsers,
    isError,
    error,
  } = useQuery({
    queryKey: ["dropdown_users"],
    queryFn: getUsersForDropdown,
    staleTime: Infinity, // never trigger a refetch until the Query is invalidated manually.
    gcTime: Infinity,
  });
  return { dropdownUsers, isFetchingUsers, isError, error };
}
