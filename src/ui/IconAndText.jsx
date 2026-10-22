import "./IconAndText.css";
function IconAndText({ src, alt, children, size = "md", className = "" }) {
  return (
    <div className={`icon-and-text ${size} ${className}`}>
      <div className={`icon-frame ${size}`}>
        <img src={src} alt={alt} />
      </div>
      <span>{children}</span>
    </div>
  );
}

export default IconAndText;
