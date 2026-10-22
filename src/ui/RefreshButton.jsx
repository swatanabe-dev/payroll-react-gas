import { refresh, refreshGif } from "../assets";

import "./RefreshButton.css";
function RefreshButton({ userId, year, month, onRefresh, title = "" }) {
  function handleClick(e) {
    e.stopPropagation();
    onRefresh({ userId, year, month }); // = generateMultiplePayslips(userId,year, month)
  }

  return (
    <button
      type="button"
      title={title}
      className="refresh-button"
      onClick={handleClick}
    >
      <div className="refresh-button__stacked-icons">
        <img src={refresh} alt="" className="refresh-button__static-icon" />
        <img src={refreshGif} alt="" className="refresh-button__gif-icon" />
      </div>
    </button>
  );
}

export default RefreshButton;
