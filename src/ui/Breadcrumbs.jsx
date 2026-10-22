import MoveBackButton from "./moveBackButton";

import "./Breadcrumbs.css";
function Breadcrumbs({ prevPages = [], currPage = [], returnUrl = "" }) {
  const crumbs = [...prevPages, ...currPage];

  let breadcrumbs = [];

  crumbs.map((crumb, index) => {
    if (index === 0) {
      breadcrumbs.push(crumb);
    } else {
      breadcrumbs.push(" > ", crumb);
    }
  });

  return (
    <div className="breadcrumbs-wrapper">
      <MoveBackButton returnUrl={returnUrl} />
      <div className="breadcrumbs">
        {breadcrumbs && <div>{breadcrumbs}</div>}
      </div>
    </div>
  );
}

export default Breadcrumbs;
