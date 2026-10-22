import { useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import Button from "../../../ui/Button";
import Heading from "../../../ui/Heading";
import PayslipPreview from "./PayslipPreview";
import SalariesDropdown from "../../Salaries/SalariesDropdown";

import { useGetAvailablePayslipPeriods } from "../../Salaries/useGetAvailablePayslipPeriods";
// import { useGetPayslipsForPeriod } from "../../Salaries/useGetPayslipsForPeriod";
import { useProcessMultiplePayslips } from "../../Salaries/useProcessMultiplePayslips";
import { generatePayslipsPDF } from "../pdf/generatePayslipsPDF";

import "./PayslipPreviewLayout.css";

function PayslipPreviewLayout() {
  const { userId } = useParams();
  const location = useLocation();
  const { payeeName } = location.state || {};

  const [searchParams, setSearchParams] = useSearchParams();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [payslipData, setPayslipData] = useState(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  const defaultMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const defaultYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const urlYear = searchParams.get("year");
  const urlMonth = searchParams.get("month");

  // activePeriod: period that's displayed
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

  const { generatePayslipsData, isGenerating: isGeneratingPayslipData } =
    useProcessMultiplePayslips();

  // Loading...
  const loadingMessage = isPendingDropdown
    ? "Reading available periods..."
    : isGeneratingPayslipData
      ? "Calculating..."
      : isGeneratingPDF
        ? "Generating PDF..."
        : null;

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

    // Pass the existing state forward so payeeName isn't lost
    setSearchParams(searchParams, {
      state: location.state,
      replace: true,
    });
  }

  async function handleUpdate() {
    try {
      const result = await generatePayslipsData({
        userIds: [userId],
        year: activePeriod.year,
        month: activePeriod.month,
      });

      if (result?.succeeded?.length) {
        setPayslipData(result.succeeded[0].payslip);
      } else {
        setPayslipData(null);
        toast.error("Failed to read the data.");
      }
    } catch (error) {
      console.error("Payslip data generation failed @handleUpdate", error);
    }
  }

  async function handleGeneratePDF() {
    if (!userId || !activePeriod.year || !activePeriod.month) {
      alert("Select a pay stub period.");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const result = await generatePayslipsData({
        userIds: [userId],
        year: activePeriod.year,
        month: activePeriod.month,
      });

      if (!result) {
        toast.error(`Failed to calculate salary amount for the period.`);
      }

      if (result?.succeeded?.length) {
        await generatePayslipsPDF(result.succeeded.map((s) => s.payslip));
      }
    } catch (err) {
      console.error("PDF generation failed @handleGeneratePDF", err);
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  return (
    <div className="payslip-preview-layout">
      <Heading type="h3-bold">{`Name: ${payeeName}`}</Heading>
      <div className="payslip-preview-layout__actions">
        <SalariesDropdown
          periods={periods}
          userSelectedPeriod={activePeriod}
          onChange={handlePeriodChange}
          disabled={isGeneratingPDF}
          isError={isDropDownError}
        />
        <div className="payslip-preview-layout__actions-btns">
          <Button
            onClickFunction={handleUpdate}
            buttonStyle="secondary"
            buttonRadius="round"
          >
            Update
          </Button>
          <Button
            onClickFunction={handleGeneratePDF}
            buttonStyle="primary"
            buttonRadius="round"
          >
            Generate PDF
          </Button>
        </div>
      </div>
      <hr className="payslip-preview-layout__divider" />
      <div className="payslip-preview-layout__scroll-container">
        <PayslipPreview payslip={payslipData} />
      </div>
    </div>
  );
}

export default PayslipPreviewLayout;
