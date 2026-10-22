import { check, dash } from "../../assets";
import { LEN_TO_SHOW_TITLE } from "../../utils/constants";

import "./PrizeTableRow.css";

function PrizeTableRow({
  fields = [],
  dataRow = [],
  lastColIndex = 0,
  rowIndex,
}) {
  return (
    <tr key={dataRow.userId ?? rowIndex} className="prize-table-body-row">
      <td className="prize-td sticky">
        <div
          className="prize-td--content"
          title={
            dataRow.name.length >= LEN_TO_SHOW_TITLE ? dataRow.name : undefined
          }
        >
          {dataRow.name}
        </div>
      </td>
      {fields.map((field, index) => {
        const isTrue = field.render(dataRow);
        return (
          <td
            className={`prize-td ${
              index === lastColIndex - 1 ? "sticky-last-col" : ""
            }`}
            style={{ textAlign: field.textAlign }}
            key={field.key}
          >
            {isTrue ? (
              <img className="check-mark" src={check} alt="awarded" />
            ) : (
              <img className="check-mark" src={dash} alt="not awarded" />
            )}
          </td>
        );
      })}
    </tr>
  );
}

export default PrizeTableRow;
