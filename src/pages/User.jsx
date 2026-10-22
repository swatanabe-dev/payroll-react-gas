import UserLayout from "../features/Users/UserLayout";
import Breadcrumbs from "../ui/Breadcrumbs";

function User() {
  // NOTE: useSearchParams for currPage if that makes sense

  const prevPages = ["Employees"];
  const currPage = [`Employee Details`];
  return (
    <>
      <Breadcrumbs
        prevPages={prevPages}
        currPage={currPage}
        returnUrl="/users"
      />
      <UserLayout />
    </>
  );
}

export default User;
