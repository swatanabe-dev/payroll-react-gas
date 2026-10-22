import WorkSummary from "./WorkSummary";
import Heading from "../../ui/Heading";
import Loading from "../../ui/Loading";
import { dateGreen, dateBg, timeOrange, timeBg } from "../../assets";

import "./UserWorkStatus.css";
import { useGetUserWorklogsForPeriod } from "../WorkLogs/useGetUserWorklogsForPeriod";
import { toEngMonth } from "../../utils/toEngMonth";

function UserWorkStatus() {
  // TODO: FOR TEST ONLY. BEFORE SHIPPING - Uncomment the following upon actual deployment
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // TODO: BEFORE SHIPPING - Delete 'year' and 'month' upon actual deployment
  // const year = 2026;
  // const month = 4;

  const { userWorklogs, isPending } = useGetUserWorklogsForPeriod(year, month);

  if (isPending || !userWorklogs)
    return (
      <div className="loading-container">
        <Loading>Reading overview...</Loading>
      </div>
    );

  const byWorkHours = userWorklogs.reduce(
    (acc, curr) => {
      const hours = parseFloat(curr.hoursWorked);

      const label = hours >= 4 ? "Full Day" : "Half Day";

      const target = acc.find((item) => item.label === label);
      if (target) {
        target.value += 1;
      }

      return acc;
    },
    [
      { label: "Half Day", value: 0 },
      { label: "Full Day", value: 0 },
    ],
  );

  const byWorkTypes = Object.values(
    userWorklogs.reduce((acc, { workType, hoursWorked }) => {
      const hours = parseFloat(hoursWorked) ?? 0;

      if (!acc[workType]) {
        acc[workType] = { label: workType, value: 0 };
      }

      acc[workType].value += hours;

      return acc;
    }, {}),
  );

  return (
    <div className="user-work-status">
      <Heading type="h3-bold">
        Attendance Overview - {toEngMonth(month)} {year}
      </Heading>
      <div className="work-status-container">
        <WorkSummary
          title="Days Worked"
          categoryTotals={byWorkHours}
          icon={dateGreen}
          watermark={dateBg}
          unit="days"
        />
        <WorkSummary
          title="Hours Worked"
          categoryTotals={byWorkTypes}
          icon={timeOrange}
          watermark={timeBg}
          unit="hours"
          unitAbbr="hrs"
        />
      </div>
    </div>
  );
}

export default UserWorkStatus;
