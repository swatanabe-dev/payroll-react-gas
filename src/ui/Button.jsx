import "./Button.css";

function Button({
  onClickFunction,
  buttonStyle = "primary",
  buttonSize = "btn--lg",
  buttonRadius = "round",

  type = "button",
  isProcessing = false,
  isDisabled = false,
  children,
}) {
  return (
    <button
      type={type}
      onClick={onClickFunction}
      className={`${buttonStyle} ${buttonSize} ${buttonRadius}`}
      disabled={isProcessing || isDisabled}
    >
      {isProcessing ? "Processing..." : children}
    </button>
  );
}

export default Button;
