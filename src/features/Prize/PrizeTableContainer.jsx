import { useMemo } from "react";

import { useGetMonthlyPrizeData } from "./useGetMonthlyPrizeData";
import { prizesTableSchema } from "./schema/prizesTableSchema";

import PrizeTable from "./PrizeTable";

import Loading from "../../ui/Loading";
import Heading from "../../ui/Heading";
import TableFooter from "../../ui/TableFooter";
import { toEngMonth } from "../../utils/toEngMonth";

import "./PrizeTableContainer.css";

function PrizeTableContainer({ fiscalYear, year, month }) {
  const { prizeRecords, isPending } = useGetMonthlyPrizeData(fiscalYear, month);
  const count = prizeRecords?.length ?? 0;
  const dataDate = `${toEngMonth(month, "long")} ${String(year)}`;

  // ---- schema is memoized to avoid re-creation ----
  const headers = useMemo(
    () =>
      prizesTableSchema({
        year,
      }),
    [year],
  );

  if (isPending) {
    return (
      <div style={{ height: "55vh" }} className="loading-container">
        <Loading type="stack-sm">🎯 Reading data...</Loading>
      </div>
    );
  }

  return (
    <div className="prize-table">
      <div className="prize-table__header">
        <Heading type="h3-bold">Monthly Progress:</Heading>
        <span className="prize-table__as-of">As of the end of {dataDate}</span>
      </div>

      <PrizeTable fields={headers ?? []} data={prizeRecords ?? []} />
      <TableFooter count={count} unit="Employees" />
    </div>
  );
}

export default PrizeTableContainer;
