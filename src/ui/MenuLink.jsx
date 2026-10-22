import { NavLink } from "react-router";

import "./MenuLink.css";

function MenuLink({ path, src, alt, children, classname = "vertical-nav" }) {
  return (
    <li className={classname}>
      <NavLink to={path}>
        {src && <img src={src} alt={alt} className="link-icon" />}
        <span className="link-text">{children}</span>
      </NavLink>
    </li>
  );
}

export default MenuLink;
