function PrizeTableHeader({ year = "yyyy", month = "M" }) {
  return (
    <>
      <span className="prize-th-year">F{year}</span>
      {month}
    </>
  );
}

export default PrizeTableHeader;
