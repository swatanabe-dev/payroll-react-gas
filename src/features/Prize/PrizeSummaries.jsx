import { award } from "../../assets";
import Heading from "../../ui/Heading";
import Loading from "../../ui/Loading";
import PrizeWinners from "./PrizeWinners";

import { useGetPrizeWinnersForPeriod } from "./useGetPrizeWinnersForPeriod";
import { toEngMonth } from "../../utils/toEngMonth";

import "./PrizeSummaries.css";

function PrizeSummaries({ fiscalYear, year, month }) {
  const { winners, isPending } = useGetPrizeWinnersForPeriod(fiscalYear, month);
  const dataDate = `${toEngMonth(month, "long")} ${String(year)}`;
  if (isPending) {
    return (
      <div style={{ height: "13.75rem" }} className="loading-container">
        <Loading type="stack-sm">🏆 Reading recipients...</Loading>
      </div>
    );
  }

  const prizeCategories = [
    {
      category: "3 Months Awards",
      caption: "Every 3 Mo",
      src: award,
      alt: "attendance prize",
      winners: winners?.TYPE1,
    },
    {
      category: "6 Months Awards",
      caption: "6-Mo straight",
      src: award,
      alt: "attendance prize",
      winners: winners?.TYPE2,
    },
    {
      category: "12 Months Awards",
      caption: "12-Mo straight",
      src: award,
      alt: "attendance prize",
      winners: winners?.TYPE3,
    },
  ];

  return (
    <div className="prize-summaries">
      <div className="prize-summaries__header">
        <Heading type="h3-bold">Recipients:</Heading>
        <span className="prize-summaries__as-of">
          As of the end of {dataDate}
        </span>
      </div>
      <div className="prize-summaries__summaries">
        {prizeCategories.map((prizeCategory) => (
          <PrizeWinners
            month={month}
            src={prizeCategory.src}
            alt={prizeCategory.alt}
            title={prizeCategory.category}
            caption={prizeCategory.caption}
            key={prizeCategory.category}
            winners={prizeCategory.winners}
          />
        ))}
      </div>
    </div>
  );
}

export default PrizeSummaries;
