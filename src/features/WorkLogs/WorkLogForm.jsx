import { useFieldArray, useForm } from "react-hook-form";

import IconButton from "../../ui/IconButton";
import Button from "../../ui/Button";
import FormSelectRow from "../../ui/FormSelectRow";
import FormRow from "../../ui/FormRow";
import Loading from "../../ui/Loading";

import { defaultDatePickerDate } from "../../utils/defaultDatePickerDate";
import { formatLogForEdit } from "../../utils/formatLogForEdit";
import { useModal } from "../../contexts/ModalContext";
import { useWorkLogFormData } from "./useWorkLogFormData";
import { useWorkLogSubmit } from "./useWorkLogSubmit";

import "./WorkLogForm.css";

function WorkLogForm({ logToEdit = {} }) {
  const { modal, closeModal } = useModal();
  const mode = modal?.type === "WORKLOG_EDIT" ? "edit" : "add";

  const { register, control, handleSubmit, reset, formState, watch } = useForm({
    defaultValues: mode === "edit" ? formatLogForEdit(logToEdit) : {},
  });

  const { errors } = formState;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "adjustments",
  });

  // Dynamically loads work hours based on the "workType"
  const selectedWorkType = watch("workType") || "";

  // Loads up the form dropdowns
  const {
    isLoading,
    dropdownUsers,
    dropdownWorkTypes,
    workTypeOptions,
    mealOptions,
    transpOptions,
  } = useWorkLogFormData(selectedWorkType);

  const { submit, isProcessing } = useWorkLogSubmit({ mode, logToEdit, reset });

  if (isLoading || isProcessing)
    return (
      <div className="loading-container full-screen">
        <Loading>{isLoading ? "Loading form..." : "Processing..."}</Loading>
      </div>
    );

  const today = defaultDatePickerDate();

  return (
    <div className="worklog-form__container">
      <IconButton onClick={closeModal} className="close-button">
        X
      </IconButton>

      <form onSubmit={handleSubmit(submit)} className="worklog-form">
        <FormSelectRow
          label="Name"
          error={errors?.userInfo?.message}
          register={register}
          name="userInfo"
          disabled={isProcessing}
        >
          {dropdownUsers?.length > 0 ? (
            dropdownUsers.map((user) => (
              <option
                value={JSON.stringify({
                  userId: user.userId,
                  name: `${user.firstName} ${user.lastName}`,
                })}
                key={user.userId}
              >
                {user.firstName} {user.lastName}
              </option>
            ))
          ) : (
            <option disabled value="">
              No settings yet
            </option>
          )}
        </FormSelectRow>

        <FormRow label="Date" error={errors?.date?.message}>
          <input
            type="date"
            name="date"
            id="date"
            defaultValue={today}
            max={today}
            className="date-picker"
            disabled={isProcessing}
            {...register("date", {
              required: `Required ☺️`,
            })}
          />
        </FormRow>

        <FormSelectRow
          label="Work Type"
          error={errors?.workType?.message}
          register={register}
          name="workType"
          disabled={isProcessing}
        >
          {dropdownWorkTypes?.length > 0 ? (
            dropdownWorkTypes.map((workType) => (
              <option value={workType} key={workType}>
                {workType}
              </option>
            ))
          ) : (
            <option disabled value="">
              No settings yet
            </option>
          )}
        </FormSelectRow>

        <FormSelectRow
          label="Hours Worked"
          error={errors?.hoursWorked?.message}
          register={register}
          name="hoursWorked"
          disabled={!selectedWorkType || isProcessing}
        >
          {workTypeOptions?.length > 0 ? (
            workTypeOptions.map((typeOption) => (
              <option
                value={typeOption.optionValue}
                key={typeOption.workTypeId}
              >
                {typeOption.optionName}
              </option>
            ))
          ) : (
            <option disabled value="">
              No settings yet
            </option>
          )}
        </FormSelectRow>

        <FormSelectRow
          label="Meal Cost"
          error={errors?.meal?.message}
          register={register}
          name="meal"
          disabled={isProcessing}
        >
          {mealOptions?.length > 0 ? (
            mealOptions.map((mealDeductible) => (
              <option
                value={mealDeductible.amount}
                key={mealDeductible.mealDeductibleId}
              >
                {mealDeductible.amount}
              </option>
            ))
          ) : (
            <option disabled value="">
              No settings yet
            </option>
          )}
        </FormSelectRow>

        <FormSelectRow
          label="Transit Cost"
          error={errors?.transportation?.message}
          register={register}
          name="transportation"
          disabled={isProcessing}
        >
          {transpOptions?.length > 0 ? (
            transpOptions?.map((transpAllowance) => (
              <option
                value={transpAllowance.amount}
                key={transpAllowance.transpAllowId}
              >
                {transpAllowance.amount}
              </option>
            ))
          ) : (
            <option disabled value="">
              No settings yet
            </option>
          )}
        </FormSelectRow>

        {/* Dynamic Adjustments Section */}
        <div className="worklog-form__adjustments-header">
          <button
            type="button"
            onClick={() => append({ type: "addition", label: "", amount: 0 })}
            className="worklog-form__adjustments-add-btn"
            disabled={isProcessing}
          >
            Add adjustments [+]
          </button>
        </div>

        {fields.map((field, index) => (
          <section
            className="worklog-form__adjustments-container"
            key={field.id}
          >
            <div className="worklog-form__adjustments-row-title">
              <span>Adjustment #{index + 1}</span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="worklog-form__adjustments-remove-btn"
                disabled={isProcessing}
              >
                Delete [-]
              </button>
            </div>

            <FormSelectRow
              label="Type"
              error={errors?.adjustments?.[index]?.type?.message}
              register={register}
              name={`adjustments.${index}.type`}
              disabled={isProcessing}
            >
              <option value="addition">Add</option>
              <option value="deduction">Deduct</option>
            </FormSelectRow>

            <FormRow
              label="Item Name"
              error={errors?.adjustments?.[index]?.label?.message}
            >
              <input
                type="text"
                name="adjustmentLabel"
                id={`adjustments.${index}.label`}
                placeholder="e.g. Special Bonus"
                disabled={isProcessing}
                {...register(`adjustments.${index}.label`, {
                  required: `Required ☺️`,
                  maxLength: { value: 8, message: "Max 8 letters" },
                })}
              />
            </FormRow>

            <FormRow
              label="Amount"
              error={errors?.adjustments?.[index]?.amount?.message}
            >
              <input
                type="number"
                id={`adjustments.${index}.amount`}
                placeholder="E.g., 850"
                disabled={isProcessing}
                {...register(`adjustments.${index}.amount`, {
                  required: `Required ☺️`,
                  valueAsNumber: true,
                  min: { value: 1, message: "1 or greater" },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Positive numbers only",
                  },
                })}
              />
            </FormRow>
          </section>
        ))}

        <div className="worklog-form__buttons">
          <Button
            type="submit"
            buttonRadius="square"
            buttonSize="btn--md"
            isProcessing={isProcessing}
          >
            {modal?.type === "WORKLOG_EDIT" ? "Update" : "Submit"}
          </Button>
          <Button
            buttonStyle="secondary"
            buttonSize="btn--md"
            buttonRadius="square"
            onClickFunction={closeModal}
            isProcessing={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default WorkLogForm;
