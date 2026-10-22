import IconAndText from "../../ui/IconAndText";

import "./PrizeWinners.css";

function PrizeWinners({ src, alt, title, caption, winners = [] }) {
  return (
    <div className="prize-winners">
      <IconAndText src={src} alt={alt} className="bottom-border">
        {title}
        <span
          style={{
            fontSize: "0.48rem",
            color: "var(--sub-font-color)",
            paddingLeft: "0.48rem",
          }}
        >
          {caption}
        </span>
      </IconAndText>

      <div className="prize-winners__summaries">
        <div className="prize-winners__total">
          <div className="prize-winners__number">
            {winners.length > 0 && winners.length < 10
              ? `0${winners.length}`
              : winners.length}
            <span>EE</span>
          </div>
        </div>
        <div className="prize-winners_list">
          <ul>
            {winners.length > 0 ? (
              winners.map((name, i) => <li key={`${name}-${i}`}>{name}</li>)
            ) : (
              <p>No recipients</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PrizeWinners;
