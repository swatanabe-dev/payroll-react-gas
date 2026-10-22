import { useForm } from "react-hook-form";

import { useModal } from "../../contexts/ModalContext";
import { useSavingsSubmit } from "./useSavingsSubmit";
import { defaultDatePickerDate } from "../../utils/defaultDatePickerDate";

import Loading from "../../ui/Loading";
import Modal from "../../ui/Modal";
import IconButton from "../../ui/IconButton";
import Heading from "../../ui/Heading";
import FormRow from "../../ui/FormRow";
import Button from "../../ui/Button";

// NOTE: Savings form uses CSS from user form CSS

function SavingsForm({ transactionToEdit = {} }) {
  const { modal, closeModal } = useModal();
  const mode = modal?.type === "SAVINGS_EDIT" ? "edit" : "add";

  /**@type {Object} transactionToEdit - {savingsId, userId, transactionDate, transactionType, amount, note,} */
  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: mode === "edit" ? transactionToEdit : {},
  });
  const { errors } = formState;

  const { submit, isProcessing } = useSavingsSubmit({
    mode,
    transactionToEdit,
    reset,
  });

  const today = defaultDatePickerDate();

  function onCancel() {
    reset();
    closeModal();
  }

  if (isProcessing)
    return (
      <Modal>
        <div className="loading-container full-screen">
          <Loading> Processing...</Loading>
        </div>
      </Modal>
    );

  return (
    <div className="user-form">
      <IconButton onClick={closeModal} className="user-close-button">
        X
      </IconButton>

      <form
        onSubmit={handleSubmit(submit)}
        className="user-form__form-contents"
      >
        <Heading type="h3">
          <strong>Savings</strong> details
        </Heading>

        <FormRow label="Date" error={errors?.transactionDate?.message}>
          <input
            type="date"
            name="transactionDate"
            id="transactionDate"
            defaultValue={today}
            max={today}
            disabled={isProcessing}
            {...register("transactionDate", { required: "Required :)" })}
            className="date-picker"
          />
        </FormRow>

        <FormRow
          label="Transaction Type"
          error={errors?.transactionType?.message}
        >
          <select
            name="transactionType"
            id="transactionType"
            disabled={isProcessing}
            {...register("transactionType", {
              required: `Required ☺️`,
            })}
          >
            <option value="">-- SELECT --</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
          </select>
        </FormRow>

        <FormRow label="Amount" error={errors?.amount?.message}>
          <input
            type="number"
            name="amount"
            id="amount"
            disabled={isProcessing}
            {...register("amount", { required: "Required :)" })}
          />
        </FormRow>

        <FormRow label="Memo" error={errors?.note?.message}>
          <textarea
            name="note"
            id="note"
            disabled={isProcessing}
            {...register("note")}
          />
        </FormRow>

        <div className="user-form__buttons">
          <Button
            type="submit"
            buttonRadius="square"
            buttonSize="btn--md"
            isProcessing={isProcessing}
          >
            {modal?.type === "SAVINGS_EDIT" ? "Edit" : "Save"}
          </Button>
          <Button
            buttonRadius="square"
            buttonStyle="secondary"
            buttonSize="btn--md"
            onClickFunction={onCancel}
            isProcessing={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SavingsForm;
