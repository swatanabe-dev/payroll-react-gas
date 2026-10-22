import "./Status.css";
function Status({ statusStyle = "status--pending", children }) {
  return <div className={`status ${statusStyle}`}>{children}</div>;
}

export default Status;
