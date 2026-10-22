import { formatNumber } from "../../../utils/formatNumber";

export const usersTableSchema = [
  {
    key: "name",
    label: "Name",
    render: (user) =>
      user.lastName && user.firstName
        ? `${user.firstName} ${user.lastName}`
        : "—",
    textAlign: "left",
  },
  {
    key: "status",
    label: "Status",
    // Date comes in string like this "2008-01-14T09:00:00Z"
    render: (user) =>
      user.dateLeft.length === 0 || new Date(user.dateLeft) - new Date() > 0
        ? "Active"
        : "Ended",
    textAlign: "left",
  },
  {
    key: "paymentMethod",
    label: "Payment",
    render: (user) => (user.paymentMethod === "deposit" ? "Deposit" : "Cash"),
    textAlign: "left",
  },
  {
    key: "userFee",
    label: "User Fees",
    render: (user) =>
      user.userFee ? `${formatNumber(user.userFee)} JPY` : "-",
    textAlign: "right",
  },

  {
    key: "dob",
    label: "Date of Birth",
    // Date comes in string like this "2008-01-14T09:00:00Z"
    render: (user) => user?.dob.split("T").at(0) || "-",
    textAlign: "left",
  },
  {
    key: "dateJoined",
    label: "Joined on",
    // Date comes in string like this "2008-01-14T09:00:00Z"
    render: (user) => user?.dateJoined.split("T").at(0) || "-",
    textAlign: "left",
  },
  {
    key: "dateLeft",
    label: "Left on",
    // Date comes in string like this "2008-01-14T09:00:00Z"
    render: (user) => user?.dateLeft.split("T").at(0) || "-",
    textAlign: "left",
  },
];
