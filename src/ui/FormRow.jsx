import "./FormRow.css";

function FormRow({ label, error, children }) {
  return (
    <div className="form-row">
      {label && (
        <label htmlFor={children.props.id} className="form-row__input-label">
          {label}
        </label>
      )}
      <span className="form-row__input-wrapper">{children}</span>

      {error && <span className="form-row__form-error-message">{error}</span>}
    </div>
  );
}

export default FormRow;
