import "./ListRow.css";

function ListRow({
  valueType = "text",
  itemLabel,

  unit = "",
  children,
}) {
  const [year, month, date] =
    valueType === "date" && children
      ? children.split("/")
      : ["????", "??", "??"];

  return (
    <div className="list-row">
      <div className="row-label">{itemLabel}&#65306;</div>
      {valueType === "text" && (
        <p className="row-value">
          {children}
          <span className="value-unit">{unit}</span>
        </p>
      )}
      {valueType === "date" && (
        <p className="row-value">
          {year}
          <span className="value-unit">年</span>
          {month}
          <span className="value-unit">月</span>
          {date}
          <span className="value-unit">日</span>
        </p>
      )}
      {valueType === "memo" && <div className="memo-row-value">{children}</div>}
    </div>
  );
}

export default ListRow;
