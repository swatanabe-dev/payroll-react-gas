import PrizeSummaries from "./PrizeSummaries";
import PrizeTableContainer from "./PrizeTableContainer";

import "./PrizeLayout.css";
function PrizeLayout() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const dataMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const dataYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const dataFiscalYear =
    Number(dataMonth) >= 4 ? Number(dataYear) : Number(dataYear) - 1;

  return (
    <div className="prize-layout">
      <PrizeSummaries
        fiscalYear={dataFiscalYear}
        year={dataYear}
        month={dataMonth}
      />
      <PrizeTableContainer
        fiscalYear={dataFiscalYear}
        year={dataYear}
        month={dataMonth}
      />
    </div>
  );
}

export default PrizeLayout;
