import MenuLink from "./MenuLink";
import { log, award, money, contacts, settings } from "../assets";
import "./Sidebar.css";
function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="menu">
          <p className="menu-title">Menu</p>
          <ul className="menu-list">
            <MenuLink path="/worklogs" src={log} alt="work logs">
              Worklogs
            </MenuLink>
            <MenuLink path="/salaries" src={money} alt="money">
              Salaries
            </MenuLink>
            <MenuLink path="/prizes" src={award} alt="award">
              Awards
            </MenuLink>
            <MenuLink path="/users" src={contacts} alt="users">
              Employees
            </MenuLink>
            <MenuLink path="/settings" src={settings} alt="settings">
              Settings
            </MenuLink>
          </ul>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
