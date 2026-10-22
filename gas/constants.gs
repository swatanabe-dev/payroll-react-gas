// Global variables
// ─── CONSTANTS ─────────────────────────────────────────────────────────────
/** Sheet IDs */
const SHEET_IDS = {
  // Raw inputs sheets
  USERS: "0",
  WORK_TYPE: "1653525954",
  HOURLY_RATE: "933070295",
  TRANSPORTATION: "1878410946",
  MEAL: "835909164",
  WORKLOGS: "1153167012",
  SAVINGS: "442800390",

  // Processed data sheets
  ATTENDANCE: "1948765690",
  REWARDS: "1193625752",
  PAYSLIPS: "1403419808",
  ARCHIVES: "1298358459",
};

/** Constants e.g. reward amounts, num of days, and more... */
// attendanceMonthlySheet.gs.
const DAYS_FOR_PRIZE = 20;
const NUM_OF_NON_WORKDAYS = 8;

// rewards.gs (prize & bonus)
const THREE_TIMES_PRIZE = 2200;
const SIX_MONTHS_PRIZE = 3500;
const TWELVE_MONTHS_PRIZE = 5500;
const BONUS_CONSTANTS = {
  bonusA: {
    days: 15,
    minAmount: 280,
    maxAmount: 500,
    label: "15-Day Bonus",
    type: "fifteenDays",
  },
  bonusB: {
    days: 20,
    minAmount: 280,
    maxAmount: 500,
    label: "20-Day Bonus",
    type: "twentyDays",
  },
  bonusC: {
    minAmount: 500,
    maxAmount: 1000,
    label: "Perfect Bonus",
    type: "allDays",
  },
};
const BIRTHDAY_BONUS_AMOUNT = 1500;
