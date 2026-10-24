import { LEN_TO_SHOW_TITLE } from "../utils/constants";

import "./Table.css";

// IMPORTANT!!! tableData (props) must be an array of objects
// Modifying

function Table({ fields = [], data = [], onRowClick, isFullWidth = false }) {
  const isClickable = !!onRowClick;

  return (
    <div className="scrollable-container">
      <table className={`table ${isFullWidth ? "table--full-width" : ""}`}>
        <thead className="table__header">
          <tr className="table__row--fields">
            {fields.map((field) => (
              <th
                key={field.key}
                className="table__field"
                style={{ textAlign: field.textAlign }}
              >
                {field.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="table__body">
          {data.length === 0 ? (
            <tr>
              <td colSpan={fields.length}>No data yet 🧐</td>
            </tr>
          ) : (
            data.map((dataRow, rowIndex) => (
              <tr
                key={dataRow.userId ?? dataRow.id ?? rowIndex}
                onClick={isClickable ? () => onRowClick(dataRow) : undefined}
                className={`table__row--data ${
                  isClickable ? "table__row--clickable-data" : ""
                }`}
              >
                {fields.map((field) => {
                  const content = field.render(dataRow);
                  const isString = typeof content === "string";
                  return (
                    <td
                      key={field.key}
                      className="table__data"
                      style={{ textAlign: field.textAlign }}
                      title={
                        isString && content.length > LEN_TO_SHOW_TITLE
                          ? content
                          : undefined
                      }
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
