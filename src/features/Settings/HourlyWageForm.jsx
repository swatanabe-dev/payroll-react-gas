import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { useModal } from "../../contexts/ModalContext";
import { useGetWorkTypeSettings } from "./useGetWorkTypeSettings";
import { useSaveHourlyWageSetting } from "./useSaveHourlyWageSetting";
import { useDeleteHourlyWageSetting } from "./useDeleteHourlyWage";
import { useGetHourlyWageSettings } from "./useGetHourlyWageSettings";

import Button from "../../ui/Button";
import ConfirmAction from "../../ui/ConfirmAction";
import FormRow from "../../ui/FormRow";
import Modal from "../../ui/Modal";
import IconButton from "../../ui/IconButton";
import Loading from "../../ui/Loading";
import { save, trash } from "../../assets";

import "./HourlyWageForm.css";

// MEMO: If time allows, refactor. TOO Much responsibilities here
function HourlyWageForm() {
  const [idToDelete, setIdToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Below is fetched to make the dropdown list.
  const { workTypes: workTypeSettings, isFetching: isFetchingWorkTypes } =
    useGetWorkTypeSettings();

  // Below are for the hourly wage data.
  const { hourlyWages: hourlyWageSettings, isFetching: isFetchingWages } =
    useGetHourlyWageSettings();

  const { saveHourlyWageSetting, isSaving } = useSaveHourlyWageSetting();
  const { deleteHourlyWageSetting, isDeleting } = useDeleteHourlyWageSetting();

  const workTypes = [
    ...new Set((workTypeSettings ?? []).map((setting) => setting.workType)),
  ];

  // Memoize to avoid triggering effects on every render
  const data = useMemo(() => hourlyWageSettings ?? [], [hourlyWageSettings]);

  const { register, control, handleSubmit, reset, formState, watch } =
    useForm();
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "hourlyWageSettings",
  });

  const { modal, openModal, closeModal } = useModal();

  useEffect(() => {
    const currentValues = watch("hourlyWageSettings");
    const dataChanged = JSON.stringify(currentValues) !== JSON.stringify(data);

    if (dataChanged) {
      reset({ hourlyWageSettings: data });
    }
  }, [data, reset, watch]);

  function onAddFields() {
    append({ workType: "", hourlyWage: "" });
    setIsEditing(true);
  }

  function openConfirmDelete({ field, index }) {
    if (!field.workType || !field.hourlyWage) {
      remove(index);
      setIsEditing(false);
    }
    if (field.hourlyWageId) {
      const hourlyWageId = field.hourlyWageId;
      setIdToDelete(hourlyWageId);
      openModal("CONFIRM_DELETE");
    }
  }

  function onConfirmDelete(hourlyWageId) {
    deleteHourlyWageSetting(hourlyWageId, {
      onSettled: () => {
        closeModal();
        setIdToDelete(null);
        setIsEditing(false);
      },
    });
  }

  function onCancelDelete() {
    closeModal();
    setIdToDelete(null);
  }

  function onSubmit(data, event) {
    const formRowIndex = event?.nativeEvent?.submitter?.dataset?.index;
    const settings = data.hourlyWageSettings;
    const { hourlyWageId, workType, hourlyWage } = settings.at(
      Number(formRowIndex),
    );

    saveHourlyWageSetting(
      { hourlyWageId, workType, hourlyWage },
      {
        onSettled: () => {
          reset();
          setIsEditing(false);
        },
      },
    );
  }
  if (isFetchingWorkTypes || isFetchingWages || isSaving || isDeleting) {
    return (
      <Modal>
        <div className="loading-container full-screen">
          <Loading>Processing...</Loading>
        </div>
      </Modal>
    );
  }
  return (
    <>
      <div className="hourly-wage-form__container">
        <div className="hourly-wage-form__descriptions">
          <p className="hourly-wage-form-example">
            Example: <br />
            Select &quot;Work Type&quot; from the dropdown
            <br />
            Hourly Rate: Enter number
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`hourly-wage-form ${
            data.length > 3 ? "on-hover-shadow-top" : ""
          }`}
        >
          {data && data.length === 0 && (
            <div style={{ padding: "1rem 0" }}>
              ❗️Add a &quot;Hourly Rate&quot; option.
            </div>
          )}
          {fields.map((field, index) => (
            <section className="hourly-wage-form__inputs-row" key={field.id}>
              <input
                type="hidden"
                name="hourlyWageId"
                id={`hourlyWageId${index}`}
                {...register(`hourlyWageSettings.${index}.hourlyWageId`)}
              />
              <FormRow
                label="Work Type"
                error={errors?.hourlyWageSettings?.at(index)?.workType?.message}
              >
                <select
                  className="dropdown-select"
                  name="workType"
                  id={`workType${index}`}
                  {...register(`hourlyWageSettings.${index}.workType`, {
                    required: `Required ☺️`,
                  })}
                >
                  <option>-- SELECT --</option>
                  {workTypes.map((workType) => (
                    <option value={workType} key={workType}>
                      {workType}
                    </option>
                  ))}
                </select>
              </FormRow>
              <FormRow
                label="Hourly Rate"
                error={
                  errors?.hourlyWageSettings?.at(index)?.hourlyWage?.message
                }
              >
                <input
                  type="number"
                  step="any"
                  name="hourlyWage"
                  id={`amount${index}`}
                  placeholder="E.g., 850"
                  {...register(`hourlyWageSettings.${index}.hourlyWage`, {
                    required: `Required ☺️`,
                    valueAsNumber: true, // Crucial for converting to number
                    min: { value: 0, message: "Must be >= 0." },
                  })}
                />
              </FormRow>
              <IconButton
                data-index={index}
                type="submit"
                title="Save"
                disabled={isSaving}
              >
                <img src={save} alt="save button" />
              </IconButton>
              <IconButton
                onClick={() => openConfirmDelete({ field, index })}
                title="Delete"
                disabled={isSaving}
              >
                <img src={trash} alt="delete button" />
              </IconButton>
            </section>
          ))}
        </form>
        <Button
          onClickFunction={onAddFields}
          isProcessing={isSaving || isFetchingWages}
          isDisabled={isEditing}
        >
          + Add Field
        </Button>
      </div>
      {modal?.type === "CONFIRM_DELETE" && (
        <Modal>
          <ConfirmAction
            onConfirm={() => onConfirmDelete(idToDelete)}
            onCancel={onCancelDelete}
            isProcessing={isDeleting}
          />
        </Modal>
      )}
    </>
  );
}

export default HourlyWageForm;
