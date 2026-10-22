import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";

import { useGetWorkTypeSettings } from "./useGetWorkTypeSettings";
import { useSaveWorkTypeSetting } from "./useSaveWorkTypeSetting";
import { useDeleteWorkTypeSetting } from "./useDeleteWorkSetting";
import { useModal } from "../../contexts/ModalContext";
import FormRow from "../../ui/FormRow";
import IconButton from "../../ui/IconButton";
import Button from "../../ui/Button";
import Loading from "../../ui/Loading";
import ConfirmAction from "../../ui/ConfirmAction";
import Modal from "../../ui/Modal";
import { save, trash } from "../../assets";
import "./WorkTypesForm.css";

function WorkTypesForm() {
  const [idToDelete, setIdToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const { modal, openModal, closeModal } = useModal();
  const { workTypes, isFetchingWorkTypes } = useGetWorkTypeSettings();
  const { saveWorkTypeSetting, isSaving } = useSaveWorkTypeSetting();
  const { isDeleting, deleteWorkTypeSetting } = useDeleteWorkTypeSetting();

  // Memoize to avoid triggering effects on every render
  const data = useMemo(() => workTypes ?? [], [workTypes]);

  const { register, control, handleSubmit, reset, formState, watch } =
    useForm();
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "workTypeSettings",
  });

  // Effect only runs if data content actually changed
  // useEffect(() => {
  //   const currentValues = watch("workTypeSettings");
  //   const dataChanged = JSON.stringify(currentValues) !== JSON.stringify(data);

  //   if (dataChanged) {
  //     reset({ workTypeSettings: data });
  //   }
  // }, [data, reset, watch]);

  useEffect(() => {
    if (data) {
      reset({ workTypeSettings: data });
    }
  }, [data, reset]);

  function onAddFields() {
    append(
      { workType: "", optionName: "", optionValue: "" },
      {
        shouldFocus: true,
        focusName: `workTypeSettings.${fields.length}.workType`,
      },
    );
    setIsEditing(true);
  }

  function openConfirmDelete({ field, index }) {
    if (!field.workType || !field.optionName || !field.optionValue) {
      remove(index);
      setIsEditing(false);
    }
    if (field.workTypeId) {
      const workTypeId = field.workTypeId;
      setIdToDelete(workTypeId);
      openModal("WORK_TYPE_DELETE");
    }
  }

  function onConfirmDelete(workTypeId) {
    deleteWorkTypeSetting(workTypeId, {
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
    const settings = data.workTypeSettings;
    const { workTypeId, workType, optionName, optionValue } = settings.at(
      Number(formRowIndex),
    );

    saveWorkTypeSetting(
      { workTypeId, workType, optionName, optionValue },
      {
        onSettled: () => {
          reset();
          setIsEditing(false);
        },
      },
    );
  }

  if (isFetchingWorkTypes || isSaving || isDeleting) {
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
      <div className="work-types-form__container">
        <div className="work-types-form__descriptions">
          <p className="work-types-form__example">
            Example: <br />
            Work Type: Office、Option: o3, Hours Worked: 3
          </p>
          <p className="work-types__form-note">
            NOTE: &quot;Work Type&quot; and &quot;Hours Worked&quot; appear in
            the dropdown options of the Worklog form, and the corresponding{" "}
            &quot;Hours&quot; is used to calculate pay stubs.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`work-types-form ${
            data.length > 3 ? "on-hover-shadow-top" : ""
          }`}
        >
          {data && data.length === 0 && (
            <div style={{ padding: "1rem 0" }}>
              ❗️Add a &quot;Work Type&quot; option.
            </div>
          )}
          {fields.map((field, index) => (
            <section className="work-types-form__inputs-row" key={field.id}>
              <input
                type="hidden"
                name="workTypeId"
                id={`workTypeId${index}`}
                disabled={isSaving}
                {...register(`workTypeSettings.${index}.workTypeId`)}
              />
              <FormRow
                label="Work Type"
                error={errors?.workTypeSettings?.at(index)?.workType?.message}
              >
                <input
                  type="text"
                  name="workType"
                  id={`workType${index}`}
                  className=""
                  placeholder="E.g., Office"
                  disabled={isSaving}
                  {...register(`workTypeSettings.${index}.workType`, {
                    required: `Required ☺️`,
                  })}
                />
              </FormRow>
              <FormRow
                label="Option Name"
                error={errors?.workTypeSettings?.at(index)?.optionName?.message}
              >
                <input
                  type="text"
                  name="optionName"
                  id={`optionName${index}`}
                  placeholder="E.g., n3.5"
                  disabled={isSaving}
                  {...register(`workTypeSettings.${index}.optionName`, {
                    required: `Required ☺️`,
                  })}
                />
              </FormRow>
              <FormRow
                label="Hours"
                error={
                  errors?.workTypeSettings?.at(index)?.optionValue?.message
                }
              >
                <input
                  type="number"
                  step="any"
                  name="optionValue"
                  id={`optionValue${index}`}
                  min="0"
                  placeholder="E.g., 3.5"
                  disabled={isSaving}
                  {...register(`workTypeSettings.${index}.optionValue`, {
                    required: `Required ☺️`,
                    valueAsNumber: true, // Crucial for converting to number
                    min: { value: 0, message: "Hours >= 0" },
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
          isProcessing={isSaving || isFetchingWorkTypes}
          isDisabled={isEditing}
        >
          + Add Field
        </Button>
      </div>

      {modal?.type === "WORK_TYPE_DELETE" && (
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

export default WorkTypesForm;
