import { useForm } from "react-hook-form";

import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Heading from "../../ui/Heading";
import IconButton from "../../ui/IconButton";
import { useModal } from "../../contexts/ModalContext";
import { useAddUser } from "./useAddUser";
import Loading from "../../ui/Loading";
import { useUpdateUser } from "./useUpdateUser";
import "./UserForm.css";
import { defaultDatePickerDate } from "../../utils/defaultDatePickerDate";

function UserForm({ userInfoToEdit = {} }) {
  const { modal, closeModal } = useModal();
  const { addUser, isAdding } = useAddUser();
  const { updateUser, isUpdating } = useUpdateUser();

  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: modal?.type === "USER_EDIT" ? userInfoToEdit : {},
  });
  const { errors } = formState;

  const isProcessing = isAdding || isUpdating;

  const today = new Date();
  const YEARS_AGO = 35;
  const pickerYear = today.getFullYear() - YEARS_AGO;

  const defaultPickerDate = defaultDatePickerDate();

  function onSubmit({
    lastName,
    firstName,
    dob,
    userFee,
    paymentMethod,
    dateJoined,
    dateLeft,
    memo,
  }) {
    if (modal?.type === "USER_ADD") {
      addUser(
        {
          firstName,
          lastName,
          dob,
          userFee,
          paymentMethod,
          dateJoined,
          memo,
        },
        { onSettled: () => reset() },
      );
    }

    if (modal?.type === "USER_EDIT") {
      updateUser(
        {
          uuid: userInfoToEdit?.uuid,
          firstName,
          lastName,
          dob,
          userFee,
          paymentMethod,
          dateJoined,
          dateLeft,
          memo,
        },
        {
          onSettled: () => {
            reset();
            closeModal();
          },
        },
      );
    }
  }

  function onCancel() {
    reset();
    closeModal();
  }

  if (isProcessing)
    return (
      <div className="loading-container full-screen">
        <Loading>Processing...</Loading>
      </div>
    );

  return (
    <div className="user-form">
      <IconButton onClick={closeModal} className="user-close-button">
        X
      </IconButton>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="user-form__form-contents"
      >
        <Heading type="h3">
          <strong>Employee</strong> details
        </Heading>

        <div className="user-form__input--name">
          <FormRow label="First Name" error={errors?.firstName?.message}>
            <input
              type="text"
              name="firstName"
              id="firstName"
              disabled={isProcessing}
              {...register("firstName", { required: "Required :)" })}
            />
          </FormRow>

          <FormRow label="Last Name" error={errors?.lastName?.message}>
            <input
              type="text"
              name="lastName"
              id="lastName"
              disabled={isProcessing}
              {...register("lastName", { required: "Required :)" })}
            />
          </FormRow>
        </div>

        <FormRow label="Date of Birth" error={errors?.dob?.message}>
          <input
            type="date"
            name="dob"
            id="dob"
            className="date-picker"
            disabled={isProcessing}
            defaultValue={`${pickerYear}-06-01`}
            {...register("dob", { required: "Required :)" })}
          />
        </FormRow>

        <FormRow label="User Fees" error={errors?.userFee?.message}>
          <input
            type="number"
            name="userFee"
            id="userFee"
            disabled={isProcessing}
            {...register("userFee", { required: "Required :)" })}
          />
        </FormRow>

        <FormRow label="Payment Method" error={errors?.paymentMethod?.message}>
          <select
            name="paymentMethod"
            id="paymentMethod"
            className="dropdown-select"
            disabled={isProcessing}
            {...register("paymentMethod", {
              required: `Required ☺️`,
            })}
          >
            <option value="">-- SELECT --</option>
            <option value="cash">Cash</option>
            <option value="deposit">Deposit</option>
          </select>
        </FormRow>

        <FormRow label="Start Date" error={errors?.dateJoined?.message}>
          <input
            type="date"
            name="dateJoined"
            id="dateJoined"
            className="date-picker"
            defaultValue={defaultPickerDate}
            disabled={isProcessing}
            {...register("dateJoined", { required: "Required :)" })}
          />
        </FormRow>

        {modal?.type === "USER_EDIT" && (
          <FormRow label="End Date" error={errors?.dateLeft?.message}>
            <input
              type="date"
              name="dateLeft"
              id="dateLeft"
              className="date-picker"
              defaultValue={defaultPickerDate}
              disabled={isProcessing}
              {...register("dateLeft")}
            />
          </FormRow>
        )}

        <FormRow label="Memo" error={errors?.memo?.message}>
          <textarea
            name="memo"
            id="memo"
            disabled={isProcessing}
            {...register("memo")}
          />
        </FormRow>

        <div className="user-form__buttons">
          <Button
            type="submit"
            buttonRadius="square"
            buttonSize="btn--md"
            isProcessing={isProcessing}
          >
            {modal?.type === "USER_EDIT" ? "Edit" : "Add"}
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

export default UserForm;
