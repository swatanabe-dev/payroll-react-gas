import { useGetMealDeductibleSettings } from "../Settings/useGetMealDeductibleSettings";
import { useGetTranspAllowanceSettings } from "../Settings/useGetTranspAllowanceSettings";
import { useGetWorkTypeSettings } from "../Settings/useGetWorkTypeSettings";
import { useGetUsersForDropdown } from "../Users/useGetUsersForDropdown";

export function useWorkLogFormData(selectedWorkType) {
  const { dropdownUsers = [], isFetchingUsers } = useGetUsersForDropdown();
  const { workTypes = [], isFetchingWorkTypes } = useGetWorkTypeSettings();
  const { mealDeductibleData = [], isFetchingMealDeductibles } =
    useGetMealDeductibleSettings();
  const { transpAllowanceData = [], isFetchingTranspAllowanceData } =
    useGetTranspAllowanceSettings();

  const isLoading =
    isFetchingUsers ||
    isFetchingWorkTypes ||
    isFetchingMealDeductibles ||
    isFetchingTranspAllowanceData;

  const dropdownWorkTypes = [...new Set(workTypes?.map((s) => s.workType))];

  const workTypeOptions = workTypes
    .filter((setting) => setting.workType === selectedWorkType)
    .sort((a, b) => Number(a.optionValue) - Number(b.optionValue));

  const mealOptions = [...mealDeductibleData].sort(
    (a, b) => Number(a.amount) - Number(b.amount),
  );

  const transpOptions = [...transpAllowanceData].sort(
    (a, b) => Number(a.amount) - Number(b.amount),
  );

  return {
    isLoading,
    dropdownUsers,
    dropdownWorkTypes,
    workTypeOptions,
    mealOptions,
    transpOptions,
  };
}
