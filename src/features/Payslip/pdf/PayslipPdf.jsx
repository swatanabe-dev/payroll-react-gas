import { Image, Text, View } from "@react-pdf/renderer";

import { nexusLogo } from "../../../assets";
import { formatNumber } from "../../../utils/formatNumber";
// import { formatPdfDate, getPaymentDate } from "../../../utils/payslipHelpers";

import { styles } from "./Styles";
import { toEngMonth } from "../../../utils/toEngMonth";
import { formatToLocalDate } from "../../../utils/formatToLocalDate";

// ─── Local constants ─────────────────────────────────────────────────────────────
const COLORS = {
  gross: "#90c21e",
  deduction: "#f59206",
  net: "#0466b7",
};

const ALLOWANCE_DISPLAY_LABELS = {
  transportation: "Commuter",
  birthdayBonus: "Birthday",
};

// ─── Sub-components ─────────────────────────────────────────────────────────────
function TotalBox({ label, value, color }) {
  return (
    <View
      style={[styles.totalBox, { backgroundColor: color, borderColor: color }]}
    >
      <Text style={styles.totalBoxLabel}>{label ?? ""}</Text>
      <Text style={styles.totalBoxValue}>{formatNumber(value ?? 0)} JPY</Text>
    </View>
  );
}

function BreakdownBox({ title, color, children, grow, minHeight }) {
  return (
    <View
      style={[
        styles.breakdownBox,
        { borderColor: color },
        grow && { flex: 1 },
        minHeight && { minHeight },
      ]}
    >
      <Text>{title ?? ""}</Text>
      {children}
    </View>
  );
}

function RowItem({ label, value, bold }) {
  return (
    <View style={styles.listRow}>
      <Text style={bold ? styles.boldText : undefined}>{label ?? ""}</Text>
      <Text style={bold ? styles.boldText : undefined}>{value ?? ""}</Text>
    </View>
  );
}

// ─── PayslipPdf ─────────────────────────────────────────────────────────────
function PayslipPdf({ payslip }) {
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
      ? [
          {
            label: birthdayBonus.label,
            type: "birthdayBonus",
            amount: birthdayBonus.amount,
          },
        ]
      : []),
  ];

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
    <View style={styles.page}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Pay Stub</Text>
        {/* <Text>{formatPdfDate(issuedAt)}</Text> */}
        <Text>{issuedAtEng ?? "MM/dd/yyyy"}</Text>
      </View>

      {/* Header Row -> Name + Net + Issuer */}
      <View style={styles.headerRow}>
        <View style={styles.payeeSection}>
          <Text style={styles.payeeName}>{payeeName ?? ""}</Text>
          <Text>
            This certifies the {toEngMonth(month, "long") ?? ""} earnings as
            detailed below.
          </Text>
          <View style={styles.flexRow}>
            <View style={styles.netBox}>
              <View style={styles.boxLabel}>
                <Text>Net Pay</Text>
              </View>
              <View style={styles.boxValue}>
                <Text>¥ {formatNumber(net ?? 0)} JPY</Text>
              </View>
            </View>
            <View style={styles.stamp}>
              <Text>Stamp</Text>
            </View>
          </View>
        </View>
        <View style={styles.issuer}>
          <View style={styles.company}>
            <Text>Nexus Ltd.</Text>
            <Image src={nexusLogo} style={styles.companyLogo} />
          </View>
          <Text>Human Resources </Text>
          <Text>321 4th Fake St. </Text>
          <Text>Suite 400</Text>
          <Text>Calgary, AB T1Y 7K7</Text>
        </View>
      </View>

      {/* Total and breakdowns */}
      <View style={styles.calcRow}>
        <View style={styles.calcColumn}>
          <TotalBox label="Net Pay" value={grossTotal} color={COLORS.gross} />
          <BreakdownBox title="Regular Pay" color={COLORS.gross} minHeight={80}>
            {workTypes.map((wt) => (
              <RowItem
                key={wt.workType}
                label={wt.workType}
                value={`${formatNumber(wt.amount)} JPY`}
              />
            ))}
          </BreakdownBox>

          <BreakdownBox
            title="Bonus/Benefit"
            color={COLORS.gross}
            minHeight={80}
          >
            {rewardItems.map((item, i) => (
              <RowItem
                key={i}
                label={
                  ALLOWANCE_DISPLAY_LABELS[item.type] ??
                  item.label ??
                  "Commuter"
                }
                value={`${formatNumber(item.amount)} JPY`}
              />
            ))}
          </BreakdownBox>
        </View>

        <View style={styles.calcColumn}>
          <TotalBox
            label="Deductions"
            value={deductionsTotal}
            color={COLORS.deduction}
          />
          <BreakdownBox title="Descriptions" color={COLORS.deduction} grow>
            {deductions.map((item, i) => (
              <RowItem
                key={i}
                label={item.label}
                value={`${formatNumber(item.amount)} JPY`}
              />
            ))}
          </BreakdownBox>
        </View>

        <View style={styles.calcColumn}>
          <TotalBox label="Net Pay" value={net} color={COLORS.net} />
          <BreakdownBox title="Net Pay" color={COLORS.net} grow>
            <RowItem
              label="Gross Pay"
              value={`${formatNumber(grossTotal)} JPY`}
              bold
            />
            <RowItem
              label="Deductions"
              value={`${formatNumber(deductionsTotal)} JPY`}
              bold
            />
            <View style={styles.line}></View>
            <RowItem label="Net Pay" value={`${formatNumber(net)} JPY`} bold />
          </BreakdownBox>
        </View>
      </View>

      {/* Attendance and Others */}
      <View style={styles.attendanceRow}>
        <View style={styles.attendanceRowItem}>
          <Text>Hours</Text>
          {summaryWorkTypes.map((wt) => (
            <View key={wt.workType} style={styles.listRow}>
              <Text>{wt.workType ?? ""}</Text>
              <Text>{wt.hoursWorked ?? 0}</Text>
            </View>
          ))}
          <View style={styles.line} />
          <View style={styles.listRow}>
            <Text>Total</Text>
            <Text>{totalHours} hours</Text>
          </View>
        </View>

        <View style={styles.attendanceRowItem}>
          <Text>Days</Text>
          {summaryWorkTypes.map((wt) => (
            <View key={wt.workType} style={styles.listRow}>
              <Text>{wt.workType ?? ""}</Text>
              <Text>{wt.daysWorked ?? 0}</Text>
            </View>
          ))}
          <View style={styles.line} />
          <View style={styles.listRow}>
            <Text>Total</Text>
            <Text>{totalDays} days</Text>
          </View>
        </View>

        <View style={styles.attendanceRowItem}>
          <Text>Others</Text>
          <View style={styles.listRow}>
            <Text>Meals</Text>
            <Text>{summary.mealCount ?? 0}</Text>
          </View>
        </View>
      </View>

      {/* Receipt */}
      <View style={styles.receipt}>
        <View style={styles.dashedLine}></View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Receipt</Text>
          <Text style={styles.mutedText}>No. {referenceNumber ?? ""}</Text>
        </View>
        <Text style={styles.payeeName}>{payeeName ?? ""}</Text>

        <View style={styles.headerRow}>
          <View style={styles.receiptDetails}>
            <View style={styles.flexRow}>
              <View style={styles.receiptAmountBox}>
                <View
                  style={[
                    styles.boxLabel,
                    {
                      color: "#070707",
                      backgroundColor: "#ffff",
                      borderTopLeftRadius: 3,
                      borderBottomLeftRadius: 3,
                      flex: 1,
                    },
                  ]}
                >
                  <Text>Amount</Text>
                </View>
                <View style={[styles.boxValue, { flex: 2 }]}>
                  <Text>¥ {formatNumber(totalMealAmount)} JPY</Text>
                </View>
              </View>
              <View style={styles.stamp}>
                <Text>Stamp</Text>
              </View>
            </View>
            <Text>Re: {toEngMonth(month, "long") ?? ""} meal expenses</Text>
            <Text>Paid in full on {paymentDate ?? "MM/15/yyyy"}</Text>
          </View>

          <View style={styles.issuer}>
            <View style={styles.company}>
              <Text>Nexus Ltd.</Text>
              <Image src={nexusLogo} style={styles.companyLogo} />
            </View>
            <Text>400 - 321 4th Fake St. </Text>
            <Text>Calgary, AB T1Y 7K7</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default PayslipPdf;
