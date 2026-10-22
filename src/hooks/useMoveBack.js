import { useLocation, useNavigate } from "react-router-dom";

export function useMoveBack(defaultFallback = "/") {
  const navigate = useNavigate();
  const location = useLocation();
  return () => {
    if (location.state?.returnUrl) {
      navigate(location.state.returnUrl);
    } else {
      // Fallback if they landed on this page directly without history state
      navigate(defaultFallback);
    }
  };
}
