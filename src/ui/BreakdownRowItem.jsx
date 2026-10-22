import "./BreakdownRowItem.css";
function BreakdownRowItem({ label, value, bold = "" }) {
  return (
    <dl className={`breakdown-row-item ${bold}`}>
      <dt className="breakdown-row-item__label">{label}</dt>
      <dd className="breakdown-row-item__value">{value}</dd>
    </dl>
  );
}

export default BreakdownRowItem;
