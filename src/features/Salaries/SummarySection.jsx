import { useState } from "react";
import Heading from "../../ui/Heading";
import Widget from "../../ui/Widget";
import { downArrow } from "../../assets";

function SummarySection({ title, widgets }) {
  const [isOpen, setIsOpen] = useState(true);

  function handleClick() {
    setIsOpen((prev) => !prev);
  }

  return (
    <div className="salary-payable__info">
      <div className="salary-payable__section-label">
        <Heading type="h3-bold">{title}</Heading>
        <div
          className="salary-payable__toggle-button"
          onClick={handleClick}
          title={isOpen ? "Close summary" : "Open summary"}
        >
          <img
            className={
              isOpen
                ? "salary-payable__toggle-button--close"
                : "salary-payable__toggle-button--open"
            }
            src={downArrow}
          />
        </div>
      </div>
      {isOpen && (
        <div className="salary-payable__widgets">
          {widgets.map((widget, index) => (
            <Widget key={index} symbol="￥" unit="JPY" {...widget} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SummarySection;
