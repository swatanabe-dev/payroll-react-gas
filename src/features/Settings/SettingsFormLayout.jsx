import { Outlet } from "react-router-dom";

import MenuLink from "../../ui/MenuLink";

import "./SettingsFormLayout.css";
function SettingsFormLayout() {
  return (
    <>
      <nav className="settings-tabs">
        <MenuLink path="work-type" classname="horizontal-nav">
          Work Type
        </MenuLink>
        <MenuLink path="hourly-wage" classname="horizontal-nav">
          Hourly Rate
        </MenuLink>
        <MenuLink path="transportation" classname="horizontal-nav">
          Transit Benefit
        </MenuLink>
        <MenuLink path="meal" classname="horizontal-nav">
          Meal Deductible
        </MenuLink>
        <MenuLink path="archives" classname="horizontal-nav">
          Archives
        </MenuLink>
      </nav>

      <div className="settings-container">
        <Outlet />
      </div>
    </>
  );
}

export default SettingsFormLayout;
