import Heading from "../../../ui/Heading";
import PayslipHeader from "../../../ui/PayslipHeader";
import BreakdownRowItem from "../../../ui/BreakdownRowItem";
import Receipt from "./Receipt";

// import { formatPdfDate, getPaymentDate } from "../../../utils/payslipHelpers";
import { formatNumber } from "../../../utils/formatNumber";
import { formatToLocalDate } from "../../../utils/formatToLocalDate";
import { toEngMonth } from "../../../utils/toEngMonth";

import "./PayslipPreview.css";

// ─── Local constants ─────────────────────────────────────────────────────────────
// Future-proof
const ALLOWANCE_DISPLAY_LABELS = {
  transportation: "Commuter",
  birthdayBonus: "Birthday",
};

function PayslipPreview({ payslip }) {
  if (!payslip)
    return (
      <div className="payslip-preview">
        <Heading type="h2-bold" className="font-color-red">
          {`Click the "Update" button`}
        </Heading>
      </div>
    );

  const {
    payeeName,
    year,
    month,
    issuedAt,
    referenceNumber,
    grossTotal,
    deductionsTotal,
    net,
    workTypes = [],
    allowances = [],
    prizes = [],
    bonuses = [],
    birthdayBonus,
    deductions = [],
    summary = {},
  } = payslip;

  // paymentDate below is for the original jp version
  // const paymentDate = getPaymentDate(year, month);
  const paymentDate = `${toEngMonth(month, "long")} 15, ${year}`;
  const totalBonusAmount = bonuses.reduce((sum, b) => sum + b.amount, 0);

  // Combine all gross reward line items — skip zero amounts
  const rewardItems = [
    ...allowances.map((a) => ({
      label: a.label,
      type: a.type,
      amount: a.amount,
    })),
    ...prizes.map((p) => ({ label: p.label, type: p.type, amount: p.amount })),
    ...(totalBonusAmount > 0
      ? [
          {
            label: "Bonus A",
            type: "attendanceBonus",
            amount: totalBonusAmount,
          },
        ]
      : []),
    ...(birthdayBonus?.amount > 0
      ? [{ label: birthdayBonus.label, amount: birthdayBonus.amount }]
      : []),
  ];
  // IF the clients prefer "separate bonus items" use below, and delete/comment out `totalBonus`
  // const rewardItems = [
  //   ...allowances.map((a) => ({
  //     label: a.label,
  //     type: a.type,
  //     amount: a.amount,
  //   })),
  //   ...prizes.map((p) => ({ label: p.label, type: p.type, amount: p.amount })),
  //   ...bonuses.map((b) => ({ label: b.label, type: b.type, amount: b.amount })),
  //   ...(birthdayBonus?.amount > 0
  //     ? [{ label: birthdayBonus.label, amount: birthdayBonus.amount }]
  //     : []),
  // ];

  const summaryWorkTypes = summary.workTypes ?? [];
  const totalHours = summaryWorkTypes.reduce(
    (sum, wt) => sum + wt.hoursWorked,
    0,
  );
  const totalDays = summaryWorkTypes.reduce(
    (sum, wt) => sum + wt.daysWorked,
    0,
  );

  const totalMealAmount =
    deductions.find((item) => item.type === "meal")?.amount ?? 0;

  // Below for Eng version only. Not in the original
  const [y, m, d] = formatToLocalDate(issuedAt).split("-");
  const issuedAtEng = `${m}/${d}/${y}`;

  return (
    <div className="payslip-preview">
      {/* Title & Date issued */}
      <div className="payslip-preview__title">
        <Heading type="h2-bold">Pay Stub</Heading>
        <div className="payslip-preview__issued-at">
          {/* {formatPdfDate(issuedAt)} */}
          {issuedAtEng}
        </div>
      </div>

      {/* Payee name, Net amount - header */}
      <PayslipHeader payeeName={payeeName} month={month} net={net} />

      {/* Payslip details - body */}
      <div className="payslip-preview__body">
        {/* Three cols */}
        <div className="payslip-preview__column-container">
          {/* Gross Total and breakdowns (work types & allowances + rewards) */}
          <section className="payslip-preview__category-column">
            {/* Gross Total */}
            <div className="payslip-preview__category-total border-color--gross">
              <div className="category-total__label label-gross">Net Pay</div>
              <div className="category-total__amount">
                ¥ {formatNumber(grossTotal ?? 0)} JPY
              </div>
            </div>

            {/* Gross breakdown */}
            <div className="category-breakdown gross-breakdown">
              <div className="gross-sub-breakdown">
                <h4 className="breakdown-title">Regular</h4>
                {workTypes.map((wt) => (
                  <BreakdownRowItem
                    key={wt.workType}
                    label={wt.workType}
                    value={`${formatNumber(wt.amount)} JPY`}
                  />
                ))}
              </div>

              {/* Allowance + Bonus breakdown */}
              <div className="gross-sub-breakdown">
                <h4 className="breakdown-title">Bonus/Benefit</h4>
                {rewardItems.map((item, i) => (
                  <BreakdownRowItem
                    key={i}
                    label={ALLOWANCE_DISPLAY_LABELS[item.type] ?? item.label}
                    value={`${formatNumber(item.amount)} JPY`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Deductibles col */}
          <section className="payslip-preview__category-column">
            <div className="payslip-preview__category-total border-color--deductions ">
              <div className="category-total__label label-deductions">
                Deductibles
              </div>
              <div className="category-total__amount">
                {formatNumber(deductionsTotal ?? 0)} JPY
              </div>
            </div>
            <div className="category-breakdown deductions-breakdown">
              <h4 className="breakdown-title">Descriptions</h4>
              {deductions.map((item, i) => (
                <BreakdownRowItem
                  key={i}
                  label={item.label}
                  value={`${formatNumber(item.amount)} JPY`}
                />
              ))}
            </div>
          </section>

          {/* Net col */}
          <section className="payslip-preview__category-column">
            <div className="payslip-preview__category-total border-color--net">
              <div className="category-total__label label-net">Net Pay</div>
              <div className="category-total__amount">
                {formatNumber(net ?? 0)}JPY
              </div>
            </div>
            <div className="category-breakdown net-breakdown">
              <h4 className="breakdown-title">Net Pay</h4>

              <BreakdownRowItem
                label="Gross Pay"
                value={`${formatNumber(grossTotal ?? 0)}JPY`}
                bold="bold"
              />
              <BreakdownRowItem
                label="Deductibles"
                value={`${formatNumber(deductionsTotal ?? 0)}JPY`}
                bold="bold"
              />
              <hr className="sum-line" />
              <BreakdownRowItem
                label="Net Pay"
                value={`${formatNumber(net ?? 0)}JPY`}
                bold="bold"
              />
            </div>
          </section>
        </div>

        {/* Attendance and others*/}
        <div className="payslip-preview__attendance">
          {/* Hours worked */}
          <div className="attendance-category category--hours">
            <h4 className="breakdown-title">Hours</h4>
            {summaryWorkTypes.map((wt) => (
              <BreakdownRowItem
                key={wt.workType}
                label={wt.workType}
                value={`${wt.hoursWorked}`}
              />
            ))}
            <hr className="sum-line" />
            <BreakdownRowItem label="Total" value={`${totalHours} hours`} />
          </div>

          {/* Days worked */}
          <div className="attendance-category category--days">
            <h4 className="breakdown-title">Days</h4>
            {summaryWorkTypes.map((wt) => (
              <BreakdownRowItem
                key={wt.workType}
                label={wt.workType}
                value={`${wt.daysWorked}`}
              />
            ))}
            <hr className="sum-line" />
            <BreakdownRowItem label="Total" value={`${totalDays} days`} />
          </div>
          {/* Others */}
          <div className="attendance-category category--others">
            <h4 className="breakdown-title">Others</h4>

            <BreakdownRowItem
              label="Meals"
              value={`${summary.mealCount ?? 0}`}
            />
          </div>
        </div>
      </div>
      <Receipt
        payeeName={payeeName}
        totalMealAmount={totalMealAmount}
        month={month}
        referenceNumber={referenceNumber}
        paymentDate={paymentDate}
      />
    </div>
  );
}

export default PayslipPreview;
