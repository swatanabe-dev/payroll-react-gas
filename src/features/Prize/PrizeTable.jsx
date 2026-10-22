import PrizeTableRow from "./PrizeTableRow";

import "./PrizeTable.css";

function PrizeTable({ fields = [], data = [] }) {
  const [name, ...months] = fields;
  const lastColIndex = months.length;

  return (
    <div className="prize-table-container">
      <table className="prize-table">
        <thead className="prize-thead">
          <tr className="prize-table-header-row sticky">
            <th className="prize-th sticky">{name.label}</th>
            {months.map((month, index) => (
              <th
                key={month.key}
                className={`prize-th ${
                  index === lastColIndex - 1 ? "sticky-last-col" : ""
                }`}
                style={{ textAlign: month.textAlign }}
              >
                {month.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={fields.length}>No data yet 🧐</td>
            </tr>
          ) : (
            data.map((dataRow, rowIndex) => (
              <PrizeTableRow
                fields={months}
                dataRow={dataRow}
                lastColIndex={lastColIndex}
                key={dataRow.userId}
                rowIndex={rowIndex}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PrizeTable;
