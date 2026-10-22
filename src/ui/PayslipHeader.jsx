import { nexusLogo } from "../assets";
import { formatNumber } from "../utils/formatNumber";
import { toEngMonth } from "../utils/toEngMonth";

import "./PayslipHeader.css";

function PayslipHeader({ payeeName, month, net }) {
  return (
    <section className="payslip-header">
      <div className="payslip-payee">
        <div className="payslip-payee__name">{payeeName}</div>
        <p className="payslip-payee__text">
          This certifies the {toEngMonth(month, "long")} earnings as detailed
          below.
        </p>
        <div className="payslip-payee__total">
          <div className="payslip-payee__total-amount">
            <div className="payslip-payee__item-name">Net Pay</div>
            <div className="payslip-payee__net">
              <span style={{ color: "var(--color-gray-400)" }}>¥ </span>
              {formatNumber(net ?? 0)}{" "}
              <span style={{ color: "var(--color-gray-400)" }}>JPY</span>
            </div>
          </div>
          <div className="payslip-payee__stamp">Stamp</div>
        </div>
      </div>
      <div className="payslip-issuer">
        <div className="payslip-issuer__company">
          <p className="payslip-issuer__company-name">Nexus Ltd.</p>
          <img
            className="payslip-issuer__company-logo"
            src={nexusLogo}
            alt="logo"
          />
        </div>
        <div className="payslip-issuer__address">
          {`Human Resources
          321 4th Fake St.
          Suite 400
         Calgary, AB  T1Y 7K7`}
        </div>
      </div>
    </section>
  );
}

export default PayslipHeader;
