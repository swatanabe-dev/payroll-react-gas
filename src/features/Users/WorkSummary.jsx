import IconAndText from "../../ui/IconAndText";
import "./WorkSummary.css";

const MAX_NUM_FOR_CENTERED_LISTS = 4;

function WorkSummary({
  title = "Title",
  categoryTotals = [],
  icon,
  watermark,
  unit = "",
  unitAbbr = "",
}) {
  const total = categoryTotals.reduce((sum, { value }) => sum + value, 0);
  const isCentered = categoryTotals.length < MAX_NUM_FOR_CENTERED_LISTS;

  return (
    <div className="work-summary">
      <IconAndText src={icon} alt={title} size="md">
        {title}
      </IconAndText>

      <div className="work-summary__stats">
        <div className="work-summary__total">
          <span className="work-summary__total-label">Total</span>
          <span className="work-summary__total-value">
            <span className="work-summary__total-number">{total} </span>
            <span className="work-summary__unit">{unit}</span>
          </span>
        </div>

        <div className="work-summary__breakdowns-container">
          {categoryTotals.length > 0 ? (
            <div
              className={`work-summary__breakdowns ${
                isCentered ? "work-summary__breakdowns--centered" : ""
              }`}
            >
              {categoryTotals.map(({ label, value }) => (
                <div className="breakdown-list__item" key={label}>
                  <span className="breakdown-list__label">{label}:</span>
                  <span className="breakdown-list__value">
                    {value}
                    <span className="breakdown-list__unit">
                      {unitAbbr ? unitAbbr : unit}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="work-summary__breakdowns work-summary__breakdowns--centered">
              <div className="work-summary__empty">No data.</div>
            </div>
          )}
        </div>
      </div>

      <div className="work-summary__watermark">
        <img src={watermark} alt="" aria-hidden="true" />
      </div>
    </div>
  );
}

export default WorkSummary;
