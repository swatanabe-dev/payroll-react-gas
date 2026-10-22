import { formatNumber } from "../../../utils/formatNumber";

export const savingsTableSchema = [
  {
    key: "date",
    label: "Date",
    // Date comes in string like this "2008-01-14T09:00:00Z"
    render: (transaction) => transaction?.date.split("T").at(0),
    textAlign: "left",
  },
  {
    key: "note",
    label: "Memo",
    render: (transaction) => transaction.note || "—",
    textAlign: "left",
  },
  {
    key: "withdraw",
    label: "Withdraw",
    render: (transaction) =>
      transaction.transactionType === "withdraw"
        ? formatNumber(transaction.amount)
        : "-",
    textAlign: "right",
  },
  {
    key: "deposit",
    label: "Deposit",
    render: (transaction) =>
      transaction.transactionType === "deposit"
        ? formatNumber(transaction.amount)
        : "-",
    textAlign: "right",
  },
  {
    key: "balance",
    label: "Balance",
    render: (transaction) => formatNumber(transaction.endBal),
    textAlign: "right",
  },
];
