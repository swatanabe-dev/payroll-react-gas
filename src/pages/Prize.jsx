import Heading from "../ui/Heading";
import PrizeLayout from "../features/Prize/PrizeLayout";

function Prize() {
  return (
    <>
      <Heading>Awards</Heading>
      <p
        style={{
          fontSize: ".8rem",
          color: "var(--color-orange-500)",
        }}
      >
        * Please update all data via the &quot;Salaries&quot; page. This page
        relies on that information.
      </p>
      <PrizeLayout />
    </>
  );
}

export default Prize;
