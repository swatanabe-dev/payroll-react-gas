import { Document, Page } from "@react-pdf/renderer";

import PayslipPdf from "./PayslipPdf";

function MultiPayslipDocument({ payslips }) {
  return (
    <Document>
      {payslips.map((payslip) => (
        <Page size="A4" key={payslip.payslipId}>
          <PayslipPdf payslip={payslip} />
        </Page>
      ))}
    </Document>
  );
}

export default MultiPayslipDocument;
