import Heading from "../../ui/Heading";
import { toEngMonth } from "../../utils/toEngMonth";
import "./SalariesDropdown.css";

function SalariesDropdown({
  periods,
  userSelectedPeriod,
  onChange,
  disabled,
  isError,
}) {
  if (!periods || periods.length === 0)
    return (
      <section className="salaries-dropdown__no-data">
        <Heading type="h3-bold">Reporting Period: </Heading>
        <p className="salaries-dropdown__no-data-text">
          No data periods available for viewing. Add worklogs via the Worklogs
          page.
        </p>
      </section>
    );

  function handleSelectChange(e) {
    const selectedValue = e.target.value;

    if (!selectedValue || selectedValue === "placeholder") return;

    const [year, month] = selectedValue.split("-").map(Number);

    onChange({ year, month });
  }

  if (isError) return <p>Whoopps! Failed to read data.</p>;

  return (
    <div className="salaries-dropdown">
      <Heading type="h3-bold">Reporting Period: </Heading>
      <select
        value={`${userSelectedPeriod.year}-${userSelectedPeriod.month}`}
        onChange={handleSelectChange}
        className="salaries-dropdown__select"
        disabled={disabled}
      >
        <option value="placeholder">-- SELECT --</option>
        {periods.map(({ year, month }) => (
          <option key={`${year}-${month}`} value={`${year}-${month}`}>
            {toEngMonth(month, "long")}, {year}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SalariesDropdown;
