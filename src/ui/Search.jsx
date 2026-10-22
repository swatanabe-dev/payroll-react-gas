import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { normalizeDateInput } from "../utils/normalizeDateInput";

import Button from "./Button";

import "./Search.css";

function Search({ options }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [searchWord, setSearchWord] = useState(
    searchParams.get("searchWord") || "",
  );

  const isSearching =
    searchParams.has("category") && searchParams.has("searchWord");

  const handleSearch = (e) => {
    e?.preventDefault(); // If wrapping this in a form

    const cleanWord =
      category === "date" ? normalizeDateInput(searchWord) : searchWord.trim();

    searchParams.set("page", 1);

    if (category && cleanWord) {
      searchParams.set("category", category);
      searchParams.set("searchWord", cleanWord);
    } else {
      searchParams.delete("category");
      searchParams.delete("searchWord");
    }

    setSearchParams(searchParams);

    if (category === "date") {
      setSearchWord(cleanWord);
    }
  };

  const handleKeyDown = (e) => {
    const isIME = e.nativeEvent.isComposing || e.keyCode === 229;

    if (e.key === "Enter" && !isIME) {
      handleSearch(e);
    }
  };

  const handleReset = () => {
    setCategory("");
    setSearchWord("");

    // Wipe the search params clean and drop back to page 1
    searchParams.delete("category");
    searchParams.delete("searchWord");
    searchParams.set("page", 1);

    setSearchParams(searchParams);
  };

  return (
    <div className="table-search">
      <div className="down-arrow">
        <select
          className="light-border select-fields"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="" disabled>
            Search in...
          </option>
          {options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        className="light-border search"
        placeholder="Search..."
        value={searchWord}
        onChange={(e) => setSearchWord(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={!category}
      />
      {isSearching && (
        <Button
          buttonStyle="delete"
          buttonSize="btn--close"
          buttonRadius="square"
          onClickFunction={handleReset}
        >
          &#10005;
        </Button>
      )}
      {/* Optional: Add a search button to trigger handleSearch */}
    </div>
  );
}

export default Search;
