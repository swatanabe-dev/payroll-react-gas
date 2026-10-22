import { formatNumber } from "../utils/formatNumber";
import "./Widget.css";

function Widget({
  label,
  descriptions,
  src = "",
  symbol = "",
  value = 0,
  unit = "",
  isBold = false,
}) {
  return (
    <section className="widget">
      <div className="widget__header">
        <div className="widget__header-texts">
          <div className="widget__header-label">{label}</div>
          <p className="widget__header-descriptions">{descriptions}</p>
        </div>
        {src && <img src={src} alt="" className="widget__header-image" />}
      </div>
      <div className="widget__value">
        <span className="widget__value-symbol">{symbol}</span>
        <div
          className={`widget__value-number ${isBold ? "widget__value-number--bold" : ""}`}
        >
          {formatNumber(value)}
        </div>
        <span className="widget__value-unit">{unit}</span>
      </div>
    </section>
  );
}

export default Widget;
