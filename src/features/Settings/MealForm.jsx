import { useGetMealDeductibleSettings } from "./useGetMealDeductibleSettings";
import { useSaveMealDeductibleSetting } from "./useSaveMealDeductibleSetting";
import { useDeleteMealDeductibleSetting } from "./useDeleteMealDeductibleSetting";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useModal } from "../../contexts/ModalContext";
import Modal from "../../ui/Modal";
import Loading from "../../ui/Loading";
import FormRow from "../../ui/FormRow";
import IconButton from "../../ui/IconButton";
import { save, trash } from "../../assets";
import Button from "../../ui/Button";
import ConfirmAction from "../../ui/ConfirmAction";

import "./MealForm.css";

function MealForm() {
  const [idToDelete, setIdToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const { modal, openModal, closeModal } = useModal();
  const { mealDeductibleData, isFetchingMealDeductibles } =
    useGetMealDeductibleSettings();
  const { saveMealDeductibleSetting, isSaving } =
    useSaveMealDeductibleSetting();
  const { deleteMealDeductibleSetting, isDeleting } =
    useDeleteMealDeductibleSetting();

  // Memoize to avoid triggering effects on every render
  const data = useMemo(() => mealDeductibleData ?? [], [mealDeductibleData]);

  const { register, control, handleSubmit, reset, formState, watch } =
    useForm();
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "mealDeductibleSettings",
  });

  // Without the 'useEffect' below, the form won't populate after initial render
  // Effect only runs if data content actually changed
  useEffect(() => {
    const currentValues = watch("mealDeductibleSettings");
    const dataChanged = JSON.stringify(currentValues) !== JSON.stringify(data);

    if (dataChanged) {
      reset({ mealDeductibleSettings: data });
    }
  }, [data, reset, watch]);

  function onAddFields() {
    append({ amount: "" });
    setIsEditing(true);
  }

  function openConfirmDelete({ field, index }) {
    if (!field.amount) {
      remove(index);
      setIsEditing(false);
    }
    if (field.mealDeductibleId) {
      const mealDeductibleId = field.mealDeductibleId;
      setIdToDelete(mealDeductibleId);
      openModal("MEAL_CONFIRM_DELETE");
    }
  }

  function onConfirmDelete(mealDeductibleId) {
    deleteMealDeductibleSetting(mealDeductibleId, {
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
    const settings = data.mealDeductibleSettings;
    const { mealDeductibleId, amount } = settings.at(Number(formRowIndex));

    saveMealDeductibleSetting(
      { mealDeductibleId, amount },
      {
        onSettled: () => {
          reset();
          setIsEditing(false);
        },
      },
    );
  }

  if (isFetchingMealDeductibles || isSaving || isDeleting) {
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
      <div className="meal-form__container">
        <div className="meal-form__descriptions">
          <p className="meal-form__example">
            Example: <br />
            Meal cost: Enter number
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`meal-form ${
            data.length > 3 ? "on-hover-shadow-top" : ""
          }`}
        >
          {isFetchingMealDeductibles || isSaving ? (
            <Loading type="inline-left">Processing...</Loading>
          ) : (
            <>
              {data && data.length === 0 && (
                <div style={{ padding: "1rem 0" }}>
                  ❗️Add &quot;Meal Cost&quot; option.
                </div>
              )}
              {fields.map((field, index) => (
                <section className="meal-form__input-row" key={field.id}>
                  <input
                    type="hidden"
                    name="mealDeductibleId"
                    id={`mealDeductibleId${index}`}
                    disabled={isSaving}
                    {...register(
                      `mealDeductibleSettings.${index}.mealDeductibleId`,
                    )}
                  />
                  <FormRow
                    label="Meal Cost"
                    error={
                      errors?.mealDeductibleSettings?.at(index)?.amount?.message
                    }
                  >
                    <input
                      type="number"
                      name="amount"
                      id={`amount${index}`}
                      placeholder="E.g., 700"
                      disabled={isSaving}
                      {...register(`mealDeductibleSettings.${index}.amount`, {
                        required: `Required ☺️`,
                        valueAsNumber: true,
                        min: { value: 0, message: "Must be >= 0" },
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
            </>
          )}
        </form>
        <Button
          onClickFunction={onAddFields}
          isProcessing={isSaving || isFetchingMealDeductibles}
          isDisabled={isEditing}
        >
          + Add Field
        </Button>
      </div>
      {modal?.type === "MEAL_CONFIRM_DELETE" && (
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

export default MealForm;
