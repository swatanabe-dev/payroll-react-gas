import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Loading from "../../ui/Loading";
import Modal from "../../ui/Modal";
import Table from "../../ui/Table";

import { salariesTableSchema } from "./schema/salariesTableSchema";
import { useProcessMultiplePayslips } from "./useProcessMultiplePayslips";
import TableFooter from "../../ui/TableFooter";

import "./SalariesTable.css";

// TODO: Tasks too much here. Try breaking it into a meaningful way
function SalariesTable({
  summaries,
  isError,
  year,
  month,
  selectedUserIds,
  toggleSelection,
  isAllSelected,
  onSelectAll,
}) {
  const { generatePayslipsData, isGenerating } = useProcessMultiplePayslips();

  const location = useLocation();
  const navigate = useNavigate();

  // Navigates to a user specific payslip page
  // Passed to <Table />
  function handleClickRow(row) {
    if (row.length === 0) return;
    navigate(`/salaries/${row.userId}`, {
      replace: false,
      state: {
        payeeName: row.payeeName,
        // Capture the entire current URL path + all search filters (?page=2&type=admin)
        returnUrl: location.pathname + location.search,
      },
    });
  }

  // Updates each table row. This calls 'processMultiplePayslips' on the GAS side
  // Passed to 'salariesTableSchema', which in turn is passed to <Table />
  const handleRefresh = useCallback(
    ({ userId, year, month }) => {
      generatePayslipsData({ userIds: [userId], year, month });
    },
    [generatePayslipsData],
  );

  // ---- schema is memoized to avoid re-creation ----
  const tableHeaders = useMemo(
    () =>
      salariesTableSchema({
        year,
        month,
        onRefresh: handleRefresh,
        selectedUserIds,
        toggleSelection,
        isAllSelected,
        onSelectAll,
      }),
    [
      year,
      month,
      handleRefresh,
      selectedUserIds,
      toggleSelection,
      isAllSelected,
      onSelectAll,
    ],
  );

  const count = summaries?.length ?? 0;

  if (isGenerating)
    return (
      <Modal>
        <div className="loading-container full-screen">
          <Loading>Calculating...</Loading>
        </div>
      </Modal>
    );

  if (isError) return <p>Failed to read data.</p>;

  return (
    <div className="salaries-table">
      <Table
        fields={tableHeaders}
        data={summaries ?? []}
        onRowClick={handleClickRow} // navigates to "INDIVIDUAL" payslip page
        isFullWidth={true}
      />
      <TableFooter count={count} />
    </div>
  );
}

export default SalariesTable;
