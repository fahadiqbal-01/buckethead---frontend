"use client";
import React, { createContext, useContext, useState } from "react";

const FilterContext = createContext({
  searchQuery: "",
  setSearchQuery: () => {},
  selectedColor: null,
  setSelectedColor: () => {},
  selectedFilter: "All",
  setSelectedFilter: () => {},
  openFilter: false,
  setOpenFilter: () => {},
});

export function FilterProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [openFilter, setOpenFilter] = useState(false);

  return (
    <FilterContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        selectedColor,
        setSelectedColor,
        selectedFilter,
        setSelectedFilter,
        openFilter,
        setOpenFilter,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  return useContext(FilterContext);
}
