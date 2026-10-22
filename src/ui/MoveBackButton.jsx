import { useMoveBack } from "../hooks/useMoveBack";

import "./MoveBackButton.css";
function MoveBackButton({ returnUrl }) {
  const moveBack = useMoveBack(returnUrl);
  return (
    <button onClick={moveBack} className="move-back-btn">
      &larr; Back
    </button>
  );
}

export default MoveBackButton;
