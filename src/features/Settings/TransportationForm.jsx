import { useEffect, useMemo, useState } from "react";

import FormRow from "../../ui/FormRow";
import Loading from "../../ui/Loading";
import { useFieldArray, useForm } from "react-hook-form";
import { useModal } from "../../contexts/ModalContext";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import ConfirmAction from "../../ui/ConfirmAction";
import IconButton from "../../ui/IconButton";
import { useDeleteTranspAllowanceSetting } from "./useDeleteTranspAllowanceSetting";
import { useGetTranspAllowanceSettings } from "./useGetTranspAllowanceSettings";
import { useSaveTranspAllowanceSetting } from "./useSaveTranspAllowanceSetting";
import { save, trash } from "../../assets";
import "./TransportationForm.css";

function TransportationForm() {
  const [idToDelete, setIdToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const { transpAllowanceData, isFetchingTranspAllowanceData } =
    useGetTranspAllowanceSettings();
  const { saveTranspAllowanceSetting, isSaving } =
    useSaveTranspAllowanceSetting();
  const { deleteTranspAllowanceSetting, isDeleting } =
    useDeleteTranspAllowanceSetting();

  // Memoize to avoid triggering effects on every render
  const data = useMemo(() => transpAllowanceData ?? [], [transpAllowanceData]);

  const { register, control, handleSubmit, reset, formState, watch } =
    useForm();
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "transpAllowanceSettings",
  });

  const { modal, openModal, closeModal } = useModal();

  // Without the 'useEffect' below, the form won't populate after initial render
  useEffect(() => {
    const currentValues = watch("transpAllowanceSettings");
    const dataChanged = JSON.stringify(currentValues) !== JSON.stringify(data);

    if (dataChanged) {
      reset({ transpAllowanceSettings: data });
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
    if (field.transpAllowId) {
      const transpAllowId = field.transpAllowId;
      setIdToDelete(transpAllowId);
      openModal("TRANSP_CONFIRM_DELETE");
    }
  }

  function onConfirmDelete(transpAllowId) {
    deleteTranspAllowanceSetting(transpAllowId, {
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
    const settings = data.transpAllowanceSettings;
    const { transpAllowId, amount } = settings.at(Number(formRowIndex));

    saveTranspAllowanceSetting(
      { transpAllowId, amount },
      {
        onSettled: () => {
          reset();
          setIsEditing(false);
        },
      },
    );
  }

  if (isFetchingTranspAllowanceData || isSaving || isDeleting) {
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
      <div className="transp-form__container">
        <div className="transp-form__descriptions">
          <p className="transp-form__example">
            Example: <br />
            Transit Benefit: Enter number
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`transp-form ${
            data.length > 3 ? "on-hover-shadow-top" : ""
          }`}
        >
          {isFetchingTranspAllowanceData || isSaving ? (
            <Loading type="inline-left">Processing...</Loading>
          ) : (
            <>
              {data && data.length === 0 && (
                <div style={{ padding: "1rem 0" }}>
                  ❗️Add a &quot;Transit Benefit&quot; option.
                </div>
              )}
              {fields.map((field, index) => (
                <section className="transp-form__input-row" key={field.id}>
                  <input
                    type="hidden"
                    name="transpAllowId"
                    id={`transpAllowId${index}`}
                    disabled={isSaving}
                    {...register(
                      `transpAllowanceSettings.${index}.transpAllowId`,
                    )}
                  />
                  <FormRow
                    label="Transit Cost"
                    error={
                      errors?.transpAllowanceSettings?.at(index)?.amount
                        ?.message
                    }
                  >
                    <input
                      type="number"
                      name="amount"
                      id={`amount${index}`}
                      placeholder="E.g., 500"
                      disabled={isSaving}
                      {...register(`transpAllowanceSettings.${index}.amount`, {
                        required: `Required ☺️`,
                        valueAsNumber: true, // Crucial for converting to number
                        min: { value: 0, message: "Must be >=0" },
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
          isProcessing={isSaving || isFetchingTranspAllowanceData}
          isDisabled={isEditing}
        >
          + Add Field
        </Button>
      </div>
      {modal?.type === "TRANSP_CONFIRM_DELETE" && (
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

export default TransportationForm;
