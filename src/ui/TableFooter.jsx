import "./TableFooter.css";

function TableFooter({ count, unit = "items" }) {
  return (
    <div className="table-footer">
      <p className="table-footer__counts">
        Total: {count ? count : "-"} {unit}
      </p>
    </div>
  );
}

export default TableFooter;
