import "./IconButton.css";

function IconButton({
  type = "button",
  title = "",
  className = "",
  iconFrameClass = "",
  onClick = null,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      className={`icon-button ${className}`}
      {...props}
    >
      <div className={`icon-frame ${iconFrameClass}`}>{children}</div>
    </button>
  );
}

export default IconButton;
