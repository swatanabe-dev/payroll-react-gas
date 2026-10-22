import { useSearchParams } from "react-router-dom";

import { LOGS_PER_PAGE } from "../utils/constants";
import Button from "./Button";
import LoadingBar from "./LoadingBar";

import "./Pagination.css";

function Pagination({ count, isPrevPending, isNextPending }) {
  // const isTesting = true;
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = !searchParams.get("page")
    ? 1
    : Number(searchParams.get("page"));

  const safeCount = count || 0;
  const pageCount = Math.ceil(safeCount / LOGS_PER_PAGE);

  function nextPage() {
    const next = currentPage === pageCount ? currentPage : currentPage + 1;
    searchParams.set("page", next);
    setSearchParams(searchParams);
  }

  function prevPage() {
    const prev = currentPage === 1 ? currentPage : currentPage - 1;
    searchParams.set("page", prev);
    setSearchParams(searchParams);
  }

  // Calculate clean display numbers for the range text
  const startItem = safeCount === 0 ? 0 : (currentPage - 1) * LOGS_PER_PAGE + 1;
  const endItem =
    currentPage === pageCount || safeCount === 0
      ? safeCount
      : currentPage * LOGS_PER_PAGE;

  return (
    <div className="pagination">
      <p className="pagination-info">
        <span>{startItem}</span> - {endItem} of {safeCount} items
      </p>

      <div className="pagination-buttons">
        {isPrevPending ? (
          <LoadingBar />
        ) : (
          <Button
            buttonStyle="no-outline"
            buttonSize="btn--sm"
            buttonRadius="square"
            onClickFunction={prevPage}
            isDisabled={currentPage === 1 || safeCount === 0}
          >{`< Prev `}</Button>
        )}
        {isNextPending ? (
          <LoadingBar />
        ) : (
          <Button
            buttonStyle="no-outline"
            buttonSize="btn--sm"
            buttonRadius="square"
            onClickFunction={nextPage}
            isDisabled={currentPage === pageCount || safeCount === 0}
          >{` Next >`}</Button>
        )}
      </div>
    </div>
  );
}

export default Pagination;
