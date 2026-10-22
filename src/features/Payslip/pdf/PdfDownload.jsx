import { PDFDownloadLink } from "@react-pdf/renderer";

import MultiPayslipDocument from "./MultiPayslipDocument";

function PdfDownload({ summaries }) {
  return (
    <PDFDownloadLink
      document={<MultiPayslipDocument summaries={summaries} />}
      fileName="payslips.pdf"
    >
      {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
    </PDFDownloadLink>
  );
}

export default PdfDownload;
