import UserDetails from "./UserDetails";
import UserWorkStatus from "./UserWorkStatus";

import Savings from "../Savings/Savings";
import "./UserLayout.css";

// NOTE: Consider if userId should be retrieved here via useParam()
function UserLayout() {
  return (
    <div className="user-layout">
      <div className="user-layout__info">
        <UserDetails />
      </div>
      <div className="user-layout__work-summary">
        <UserWorkStatus />
      </div>
      <div className="user-layout__savings">
        <Savings />
      </div>
    </div>
  );
}

export default UserLayout;
