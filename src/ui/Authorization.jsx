import { useForm } from "react-hook-form";

import FormRow from "./FormRow";
import Button from "./Button";

import "./Authorization.css";
import Heading from "./Heading";

function Authorization({
  title,
  description,
  buttonText,
  onSubmit,
  onCancel,
  isProcessing,
}) {
  const { register, handleSubmit, formState } = useForm();
  const { errors } = formState;

  function submitHandler(data) {
    onSubmit(data.authorizedBy);
  }
  return (
    <div className="authorization">
      <Heading type="h3-bold">{title}</Heading>
      {description && (
        <p className="authorization__description">{description}</p>
      )}

      <form
        onSubmit={handleSubmit(submitHandler)}
        className="authorization__form"
      >
        <FormRow label="Performed by" error={errors?.authorizedBy?.message}>
          <input
            type="text"
            id="authorizedBy"
            disabled={isProcessing}
            {...register("authorizedBy", { required: "Name required." })}
          />
        </FormRow>

        <div className="authorization__actions">
          <Button
            type="button"
            buttonStyle="secondary"
            onClickFunction={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            buttonStyle="primary"
            isProcessing={isProcessing}
          >
            {buttonText}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Authorization;
