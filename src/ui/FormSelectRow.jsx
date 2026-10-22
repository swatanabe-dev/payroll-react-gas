import FormRow from "./FormRow";

function FormSelectRow({ label, error, register, name, disabled, children }) {
  return (
    <FormRow label={label} error={error}>
      <select
        className="dropdown-select"
        disabled={disabled}
        name={name}
        id={name}
        {...register(name, { required: "Required ☺️" })}
      >
        <option value="">-- SELECT --</option>
        {children}
      </select>
    </FormRow>
  );
}

export default FormSelectRow;
