import "./Loading.css";
function Loading({ type = "stack", children }) {
  return (
    <div className={`loading ${type}`}>
      <div className="dots">
        <div style={{ "--i": 1 }} className="dot"></div>
        <div style={{ "--i": 2 }} className="dot"></div>
        <div style={{ "--i": 3 }} className="dot"></div>
        <div style={{ "--i": 4 }} className="dot"></div>
        <div style={{ "--i": 5 }} className="dot"></div>
      </div>
      <p>{children}</p>
    </div>
  );
}

export default Loading;
