import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  // Page level styles
  // Japanese build embedded Noto Sans JP here. Removed for the English version.
  page: {
    // fontFamily: "NotoSansJP",
    fontSize: 10,
    color: "#070707",
    flexDirection: "column",
    gap: 16,
    padding: 45,
  },

  boldText: {
    fontWeight: "semibold",
  },

  mutedText: {
    fontSize: 10,
    color: "#818181",
  },

  boxLabel: {
    color: "#ffff",
    fontWeight: "semibold",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
  },

  boxValue: {
    width: "100%",
    height: 36,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffff",
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },

  boxValueCol: {
    width: "100%",
    // height: 36,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffff",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    padding: 6,
  },

  // Title row
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  title: {
    fontSize: 12,
    fontWeight: "semibold",
  },

  // Header row
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  payeeSection: {
    width: 332.5,
    flexDirection: "column",
    gap: 12,
  },

  payeeName: {
    fontSize: 15,
  },

  flexRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  netBox: {
    height: 40,
    fontSize: 15,
    fontWeight: "semibold",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#0466b7",
    border: "2pt solid #0466b7 ",
    borderRadius: 5,
  },

  stamp: {
    width: 40,
    height: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    border: "1pt solid #070707",
    borderRadius: 5,
  },

  issuer: {
    flexDirection: "column",
    justifyContent: "flex-end",
    gap: 5,
  },

  company: {
    fontSize: 12,
    flexDirection: "row",
    gap: 2,
  },

  companyLogo: {
    width: 20,
  },

  // CALC SECTION
  calcRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },

  calcColumn: {
    // height: 250,
    flex: 1,
    gap: 6,
  },

  totalBox: {
    fontSize: 12,
    fontWeight: "semibold",
    flexDirection: "column",

    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: 5,
  },

  totalBoxLabel: {
    color: "#ffff",
    textAlign: "center",

    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,

    padding: 8,
  },

  totalBoxValue: {
    textAlign: "center",

    backgroundColor: "#ffff",

    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,

    padding: 8,
  },

  breakdownBox: {
    flexDirection: "column",
    gap: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 5,
    padding: 10,
  },

  attendanceRow: {
    flexDirection: "row",
    gap: 12,
    border: "1pt solid #B6BAAF",
    borderRadius: 5,

    marginTop: -10,
  },

  attendanceRowItem: {
    width: "100%",
    flex: 1,
    flexDirection: "column",
    gap: 5,
    padding: "8pt 10pt",
  },

  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 10,
  },

  line: {
    borderTop: "1pt solid #272727",
  },
  dashedLine: {
    borderTop: "1pt dashed #cbcbcb",
  },

  // Receipt
  receipt: {
    flexDirection: "column",
    gap: 16,
  },

  receiptDetails: {
    width: 300,
    flexDirection: "column",
    gap: 10,
  },

  receiptAmountBox: {
    height: 40,
    fontSize: 15,
    fontWeight: "semibold",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 1.5,
    backgroundColor: "#070707",
    border: "2pt solid #070707 ",
    borderRadius: 5,
  },
});
