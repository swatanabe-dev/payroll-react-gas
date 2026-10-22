import PayslipPreviewLayout from "../features/Payslip/preview/PayslipPreviewLayout";
import Breadcrumbs from "../ui/Breadcrumbs";
import Heading from "../ui/Heading";

function Payslip() {
  return (
    <>
      <Breadcrumbs prevPages={["Salaries"]} currPage={["Pay Stub Preview"]} />
      <Heading type="h2">Pay Stub Preview</Heading>
      <PayslipPreviewLayout />
    </>
  );
}

export default Payslip;
