import "./Heading.css";

function Heading({ type = "h2", className = "", children }) {
  return (
    <>
      {type === "h1" && (
        <h1 className={`heading-1 ${className}`}>{children}</h1>
      )}
      {type === "h2" && (
        <h2 className={`heading-2 ${className}`}>{children}</h2>
      )}
      {type === "h2-bold" && (
        <h2 className={`heading-2 bold-font ${className}`}>{children}</h2>
      )}
      {type === "h3" && (
        <h3 className={`heading-3 ${className}`}>{children}</h3>
      )}
      {type === "h3-bold" && (
        <h3 className={`heading-3 bold-font ${className}`}>{children}</h3>
      )}
    </>
  );
}

export default Heading;
