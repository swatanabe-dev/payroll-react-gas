import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import SalariesDropdown from "./SalariesDropdown";
import SalariesPayable from "./SalariesPayable";
import SalariesTable from "./SalariesTable";
import { generatePayslipsPDF } from "../Payslip/pdf/generatePayslipsPDF";

import { useGetAvailablePayslipPeriods } from "./useGetAvailablePayslipPeriods";
import { useProcessMultiplePayslips } from "./useProcessMultiplePayslips";
import { useGetPayslipsForPeriod } from "./useGetPayslipsForPeriod";

import Button from "../../ui/Button";
import Heading from "../../ui/Heading";
import Modal from "../../ui/Modal";
import Loading from "../../ui/Loading";
import { toEngMonth } from "../../utils/toEngMonth";

import "./SalariesLayout.css";

function SalariesLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const defaultMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const defaultYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const urlYear = searchParams.get("year");
  const urlMonth = searchParams.get("month");

  const activePeriod =
    urlYear && urlMonth
      ? { year: Number(urlYear), month: Number(urlMonth) }
      : { year: defaultYear, month: defaultMonth };

  // Queries
  const {
    periods,
    isPending: isPendingDropdown,
    isError: isDropDownError,
  } = useGetAvailablePayslipPeriods();

  const {
    data: { summaries, payables } = {}, // This just a summary, not a complete payslip data
    isPending: isReadingSummaries,
    isError: isSummariesError,
  } = useGetPayslipsForPeriod(activePeriod.year, activePeriod.month);

  const { generatePayslipsData, isGenerating: isGeneratingPayslipData } =
    useProcessMultiplePayslips();

  function getLoadingMessage({
    isPendingDropdown,
    isReadingSummaries,
    isGeneratingPayslipData,
    isGeneratingPDF,
    pdfProgress,
  }) {
    if (isPendingDropdown) return "Reading dropdown periods...";
    if (isReadingSummaries) return "Reading summaries...";
    if (isGeneratingPayslipData) return "Calculating...";

    if (isGeneratingPDF) {
      if (!pdfProgress) return "Generating PDF...";
      if (pdfProgress.phase === "zipping") return "Creating ZIP...";
      return `Generating ${pdfProgress.current} of ${pdfProgress.total} batches...`;
    }

    return null;
  }

  const loadingMessage = getLoadingMessage({
    isPendingDropdown,
    isReadingSummaries,
    isGeneratingPayslipData,
    isGeneratingPDF,
    pdfProgress,
  });

  if (loadingMessage) {
    return (
      <Modal>
        <div className="loading-container full-screen">
          <Loading>{loadingMessage}</Loading>
        </div>
      </Modal>
    );
  }
  // if (isError) return <p>Failed to read the data.</p>;

  function handlePeriodChange(period) {
    searchParams.set("year", period.year);
    searchParams.set("month", period.month);
    setSearchParams(searchParams);

    // Reset checkboxes when period changes
    setSelectedUserIds([]);
  }

  // Toggle a single user
  function toggleSelection(userId) {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  // Determine if all available users are currently selected
  const isAllSelected =
    summaries?.length > 0 && selectedUserIds.length === summaries.length;

  // Toggle all users on or off
  function handleSelectAll() {
    if (isAllSelected) {
      setSelectedUserIds([]);
    } else {
      const allUserIds = summaries.map((summary) => summary.userId);
      setSelectedUserIds(allUserIds);
    }
  }

  // Generate payslip data for the SELECTED users
  async function handleUpdateSelected() {
    if (!selectedUserIds.length) {
      alert("Select users to update");
      return;
    }

    try {
      const result = await generatePayslipsData({
        userIds: selectedUserIds,
        year: activePeriod.year,
        month: activePeriod.month,
      });

      if (result?.failed?.length) {
        toast.error(
          `Failed to update the data of ${result.failed.length} users.`,
        );
      } else {
        toast.success("Successfully updated!");
      }
    } catch (err) {
      console.error("Bulk update failed @handleUpdateSelected", err);
    } finally {
      setSelectedUserIds([]);
    }
  }

  // Generate payslip data for the SELECTED users
  // "AND" generate a PDF with it
  async function handleGeneratePDF() {
    if (!selectedUserIds.length) {
      alert("Select users first!");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const result = await generatePayslipsData({
        userIds: selectedUserIds,
        year: activePeriod.year,
        month: activePeriod.month,
      });

      if (result?.failed?.length) {
        toast.error(
          `Failed to generate the data of ${result.failed.length} users.`,
        );
      }

      if (result?.succeeded?.length) {
        await generatePayslipsPDF(
          result.succeeded.map((s) => s.payslip),
          setPdfProgress,
        );
      }
    } catch (err) {
      console.error("PDF generation failed @handleGeneratePDF", err);
    } finally {
      setSelectedUserIds([]);
      setIsGeneratingPDF(false);
      setPdfProgress(null);
    }
  }

  return (
    <>
      <SalariesDropdown
        periods={periods}
        userSelectedPeriod={activePeriod}
        onChange={handlePeriodChange}
        disabled={isGeneratingPDF}
        isError={isDropDownError}
      />
      {!periods || periods.length === 0 ? (
        <section className="salaries-layout__no-data">
          <div className="salaries-layout__no-data-details">
            <h4>Net Pay Total:</h4>
            <p>No worklogs available.</p>
            <p>💡 Please start recording user worklogs on the Worklogs page.</p>
          </div>
          <div className="salaries-layout__no-data-details">
            <h4>Incurred Salary Total:</h4>
            <p>No worklogs available.</p>
            <p>💡 Please start recording user worklogs on the Worklogs page.</p>
          </div>
        </section>
      ) : (
        <SalariesPayable
          payables={payables}
          prevMonth={activePeriod.month}
          isError={isSummariesError}
        />
      )}

      {!periods || periods.length === 0 ? (
        <section className="salaries-layout__no-data">
          <div className="salaries-layout__no-data-details">
            <h4>Salary Summaries:</h4>
            <p>No worklogs available.</p>
            <p>
              💡 Please start recording user worklogs on the Worklogs page.。
            </p>
          </div>
        </section>
      ) : (
        <div className="salaries-layout__table">
          <div className="salaries-layout__table-header">
            <div className="salaries-layout__table-actions">
              <Heading type="h3-bold">
                Salary Summaries for {toEngMonth(activePeriod.month, "long")}:
              </Heading>
              <span className="salaries-layout__table-descriptions">
                • Update for the latest data.
              </span>
            </div>
            <div className="salaries-layout__payslip-btns">
              <Button
                buttonStyle="primary--outlined"
                onClickFunction={handleUpdateSelected}
                isDisabled={!selectedUserIds.length || isGeneratingPayslipData}
              >
                {isGeneratingPayslipData
                  ? "Updating..."
                  : "Update Selected Users"}
              </Button>
              <Button
                onClickFunction={handleGeneratePDF}
                isDisabled={!selectedUserIds.length || isGeneratingPDF}
              >
                {isGeneratingPDF
                  ? "Generating PDF..."
                  : "Generate PDF for Selected"}
              </Button>
            </div>
          </div>
          <SalariesTable
            summaries={summaries}
            year={activePeriod.year}
            month={activePeriod.month}
            selectedUserIds={selectedUserIds}
            toggleSelection={toggleSelection}
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll}
            isReadingSummaries={isReadingSummaries}
            isError={isSummariesError}
          />
        </div>
      )}
    </>
  );
}

export default SalariesLayout;
