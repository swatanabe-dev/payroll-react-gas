import ActionsCell from "../../../ui/ActionsCell";
import { formatNumber } from "../../../utils/formatNumber";
import { calculateAdjustmentsTotal } from "../../../utils/calculateAdjustmentsTotal";

export const worklogsTableSchema = ({ onEdit, onDelete }) => [
  {
    key: "date",
    label: "Date",
    render: (log) => log?.date,
    textAlign: "left",
  },
  {
    key: "name",
    label: "Name",
    render: (log) => log.name,
    textAlign: "left",
  },
  {
    key: "workType",
    label: "Work Type",
    render: (log) => log.workType,
    textAlign: "left",
  },
  {
    key: "hoursWorked",
    label: "Hours",
    render: (log) => `${parseFloat(log.hoursWorked)}`,
    textAlign: "right",
  },
  {
    key: "meal",
    label: "Meal Cost",
    render: (log) => `${formatNumber(log.meal)}`,
    textAlign: "right",
  },
  {
    key: "transportation",
    label: "Transit Cost",
    render: (log) => `${formatNumber(log.transportation)}`,
    textAlign: "right",
  },
  {
    key: "adjustments",
    label: "Adjustments",
    render: (log) => `${calculateAdjustmentsTotal(log.adjustments)}`,
    textAlign: "right",
  },
  {
    key: "options",
    label: "Edit/Delete",
    render: (log) => (
      <ActionsCell id={log.workLogId} onEdit={onEdit} onDelete={onDelete} />
    ),
    textAlign: "center",
  },
];
