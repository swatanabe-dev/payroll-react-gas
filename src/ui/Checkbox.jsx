import "./Checkbox.css";

function Checkbox({ label, checked, onChange }) {
  return (
    <div
      className="checkbox"
      onClick={(e) => e.stopPropagation()} // prevents from opening the pay slip page when clicking the checkbox
    >
      {label && (
        <label htmlFor={label} className="checkbox__label">
          {label}
        </label>
      )}
      <input
        className="checkbox__input"
        type="checkbox"
        id={label ? label : "checkbox"}
        name={label ? label : "checkbox"}
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
}

export default Checkbox;
