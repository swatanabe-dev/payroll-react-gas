import Checkbox from "../../../ui/Checkbox";
import RefreshButton from "../../../ui/RefreshButton";
import Status from "../../../ui/Status";
import { formatNumber } from "../../../utils/formatNumber";
import { formatToLocalDate } from "../../../utils/formatToLocalDate";

export const salariesTableSchema = ({
  year,
  month,
  onRefresh,
  selectedUserIds = [],
  toggleSelection,
  isAllSelected,
  onSelectAll,
}) => [
  {
    key: "isReady",
    label: (
      <Checkbox label="PDF" checked={isAllSelected} onChange={onSelectAll} />
    ),
    render: (row) => (
      <Checkbox
        checked={selectedUserIds?.includes(row.userId)}
        onChange={() => toggleSelection(row.userId)}
      />
    ),
    textAlign: "center",
  },
  {
    key: "name",
    label: "Name",
    render: (row) => row.payeeName || "-",
    textAlign: "left",
  },
  {
    key: "gross",
    label: "Gross Pay",
    render: (row) =>
      row.grossTotal !== null ? `${formatNumber(row.grossTotal || 0)}` : "-",
    textAlign: "right",
  },
  {
    key: "deductions",
    label: "Deductions",
    render: (row) =>
      row.deductionsTotal !== null
        ? `${formatNumber(row.deductionsTotal || 0)}`
        : "-",
    textAlign: "right",
  },
  {
    key: "net",
    label: "Net Pay",
    render: (row) => (row.net !== null ? `${formatNumber(row.net || 0)}` : "-"),
    textAlign: "right",
  },
  {
    key: "status",
    label: "Calculated?",

    render: (row) => (
      <Status
        statusStyle={
          row.status === "Calculated" ? "status--completed" : "status--pending"
        }
      >
        {row.status === "Calculated" ? "Yes" : "No"}
      </Status>
    ),
    textAlign: "center",
  },
  {
    key: "updatedAt",
    label: "Last Updated",
    render: (row) =>
      row.updatedAt !== null ? formatToLocalDate(row.updatedAt) : "-",
    textAlign: "left",
  },
  {
    key: "refresh",
    label: "Update",

    render: (row) => (
      <RefreshButton
        userId={row.userId}
        year={year}
        month={month}
        onRefresh={onRefresh}
        title="Perform salary calculation"
      />
    ),
    textAlign: "center",
  },
];
