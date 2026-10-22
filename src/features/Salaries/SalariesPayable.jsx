import SummarySection from "./SummarySection";
import {
  cash,
  cashGreen,
  deposit,
  depositGreen,
  meal,
  pieChart,
  salary,
  salaryGreen,
} from "../../assets";

import "./SalariesPayable.css";
import { toEngMonth } from "../../utils/toEngMonth";

function SalariesPayable({ payables, prevMonth, isError }) {
  const {
    grandGrossTotal,
    grossDeposit,
    grossCash,
    grossWithoutNew,
    netTotal,
    netDeposit,
    netCash,
    totalMealDeductions,
  } = payables;

  if (isError) return <p>Failed to read data.</p>;

  const grossPayables = [
    {
      label: "Cash Payment",
      descriptions: "Before deductions",
      src: cashGreen,
      value: grossCash,
    },
    {
      label: "Bank Deposit",
      descriptions: "Before deductions",
      src: depositGreen,
      value: grossDeposit,
    },
    {
      label: "Gross Total",
      descriptions: "Before deductions",
      src: salaryGreen,
      value: grandGrossTotal,
    },
    {
      label: "Excl. New EE",
      descriptions: "Without new hires",
      src: pieChart,
      value: grossWithoutNew,
    },
  ];

  const netPayables = [
    {
      label: "Cash Payment",
      descriptions: "After deductions",
      src: cash,
      value: netCash,
      isBold: true,
    },
    {
      label: "Bank Deposit",
      descriptions: "After deductions",
      src: deposit,
      value: netDeposit,
      isBold: true,
    },
    {
      label: "Net Total",
      descriptions: "After deductions",
      src: salary,
      value: netTotal,
      isBold: true,
    },
    {
      label: "Meal Amount",
      descriptions: "To be invoiced",
      src: meal,
      value: totalMealDeductions,
      isBold: true,
    },
  ];

  return (
    <div className="salary-payable">
      <SummarySection
        title={`Net Total for ${toEngMonth(prevMonth, "long")}`}
        widgets={netPayables}
      />
      <SummarySection
        title={`Gross Total for ${toEngMonth(prevMonth, "long")}`}
        widgets={grossPayables}
      />
    </div>
  );
}

export default SalariesPayable;
