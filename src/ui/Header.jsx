import { nexusLogo } from "../assets";
import IconAndText from "./IconAndText";
import "./Header.css";

const companyLogo = {
  src: nexusLogo,
  alt: "nexus logo",
};

function Header() {
  return (
    <div className="header">
      <IconAndText {...companyLogo} size="lg">
        Nexus Payroll - Demo
      </IconAndText>
    </div>
  );
}
export default Header;
