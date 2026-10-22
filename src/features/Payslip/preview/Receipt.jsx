import { nexusLogo } from "../../../assets";
import Heading from "../../../ui/Heading";
import { formatNumber } from "../../../utils/formatNumber";
import { toEngMonth } from "../../../utils/toEngMonth";

import "./Receipt.css";

function Receipt({
  payeeName,
  totalMealAmount,
  month,
  referenceNumber,
  paymentDate,
}) {
  return (
    <>
      <hr className="receipt-section-line" />
      <section className="receipt">
        <div className="receipt__header">
          <Heading type="h2-bold">Invoice</Heading>
          <small className="receipt__ref-number">
            No. {referenceNumber ? referenceNumber : "-"}
          </small>
        </div>
        <div className="receipt__body">
          <Heading className="h2">
            {payeeName} <span className="receipt__suffix"></span>
          </Heading>
          <div className="receipt__amount-stamp">
            <dl className="receipt__amount-container">
              <dt className="receipt__amount-label">Amount</dt>
              <dd className="receipt__amount">
                <span className="receipt__amount-symbol">￥</span>
                {formatNumber(totalMealAmount ?? 0)}{" "}
                <span className="receipt__amount-unit">JPY</span>
              </dd>
            </dl>
            <div className="receipt__stamp">Stamp</div>
          </div>
        </div>
        <div className="receipt__footer">
          <div className="receipt__texts">
            <p className="receipt__memo">
              <span className="receipt__fixed-text">Re:</span>
              {/* {month}月分の食事代として */}
              {toEngMonth(month, "long")} meal expenses
            </p>
            <p className="receipt__memo">
              Paid in full on
              <span className="receipt__date-issued">{paymentDate}</span>
            </p>
          </div>

          <div className="receipt-issuer">
            <div className="receipt-issuer__company">
              <p className="receipt-issuer__company-name">Nexus Ltd.</p>
              <div className="receipt-issuer__logo-frame">
                <img
                  className="receipt-issuer__company-logo"
                  src={nexusLogo}
                  alt="logo"
                />
              </div>
            </div>
            <div className="receipt-issuer__address">
              {`400 - 321 4th Fake St.
      Calgary, AB  T1Y 7K7`}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Receipt;
