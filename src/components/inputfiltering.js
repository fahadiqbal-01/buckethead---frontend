"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { FiCheck, FiChevronDown, FiSearch } from "react-icons/fi";
import { useFilter } from "@/context/FilterContext";

const COLORS = [
  { id: "white", hex: "#fffff3", border: true },
  { id: "blue", hex: "#bfdbfe" },
  { id: "yellow", hex: "#fff085" },
  { id: "pink", hex: "#fccfe9" },
  { id: "orange", hex: "#ffd7a7" },
  { id: "red", hex: "#ffa3a2" },
  { id: "mud", hex: "#1d1919" },
];

const FILTER_OPTIONS = ["All", "Links", "Images", "Notes"];

export default function InputFiltering({
  inputRef,
  filterRef,
  setOpenDrawer,
}) {
  const {
    searchQuery,
    setSearchQuery,
    selectedColor,
    setSelectedColor,
    selectedFilter,
    setSelectedFilter,
    openFilter,
    setOpenFilter,
  } = useFilter();

  const [placeholder, setPlaceholder] = useState("Find your item...");

  useEffect(() => {
    const updatePlaceholder = () => {
      if (window.innerWidth < 1024) {
        setPlaceholder("search");
      } else {
        setPlaceholder("Find your item...");
      }
    };

    updatePlaceholder();
    window.addEventListener("resize", updatePlaceholder);
    return () => window.removeEventListener("resize", updatePlaceholder);
  }, []);

  const handleOptionClick = (action) => {
    action();
    if (setOpenDrawer) setOpenDrawer(false);
  };

  const hasActiveFilters = Boolean(
    selectedColor || (selectedFilter && selectedFilter !== "All")
  );

  return (
    <>
      <AnimatePresence>
        {openFilter && (
          <motion.div
            key="filter-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => handleOptionClick(() => setOpenFilter(false))}
            className="fixed inset-0 bg-mud/35 z-40 transition-opacity duration-150"
          />
        )}
      </AnimatePresence>

      <div className="relative flex flex-col items-center z-40">
        {/* Mobile View: Compact Icon Button (< md) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleOptionClick(() => setOpenFilter((prev) => !prev));
          }}
          aria-label="Search and filter"
          title="Search & filter"
          className={`md:hidden flex items-center justify-center gap-1 bg-mud rounded-full px-2.5 py-1.5 shadow-sm border-2 cursor-pointer transition-all ${
            openFilter || searchQuery || hasActiveFilters
              ? "border-yellow/50 ring-2 ring-yellow/20 text-yellow"
              : "border-transparent text-white hover:text-yellow"
          }`}
        >
          <FiSearch className="text-[15px]" />
          <FiChevronDown
            className={`text-xs transition-transform duration-200 ${
              openFilter ? "rotate-180 text-yellow" : ""
            }`}
          />
          {hasActiveFilters && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  COLORS.find((c) => c.id === selectedColor)?.hex || "#fff085",
              }}
            />
          )}
        </button>

        {/* Desktop View: Full Search Input Pill (md and up) */}
        <div
          className={`hidden md:flex relative items-center bg-mud rounded-full shadow-sm duration-200 border-2 transition-all ${
            openFilter
              ? "border-yellow/50 ring-2 ring-yellow/20"
              : "border-transparent"
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            size={
              searchQuery
                ? Math.max(searchQuery.length, placeholder.length)
                : placeholder.length
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => handleOptionClick(() => setOpenFilter(true))}
            onClick={() => handleOptionClick(() => setOpenFilter(true))}
            suppressHydrationWarning
            className="bg-transparent text-center text-white text-[15px] lg:text-[17px] font-jetreg pl-4 pr-1 py-1.5 sm:py-2 placeholder:text-white/80 placeholder:select-none focus:outline-none w-fit lg:w-72"
          />

          {/* Active filter dot indicator */}
          {hasActiveFilters && (
            <span
              className="w-2 h-2 rounded-full mr-1 shrink-0 animate-pulse"
              style={{
                backgroundColor:
                  COLORS.find((c) => c.id === selectedColor)?.hex || "#fff085",
              }}
            />
          )}

          {/* Dropdown toggle button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOptionClick(() => setOpenFilter((prev) => !prev));
            }}
            aria-label="Toggle filter dropdown"
            title="Filter options"
            className="pr-2.5 sm:pr-3 pl-1 py-1.5 sm:py-2 text-white/70 hover:text-white cursor-pointer flex items-center justify-center transition-colors"
          >
            <FiChevronDown
              className={`text-sm sm:text-base transition-transform duration-200 ${
                openFilter ? "rotate-180 text-yellow" : ""
              }`}
            />
          </button>
        </div>

        {/* Dropdown Menu perfectly positioned right underneath */}
        <AnimatePresence>
          {openFilter && (
            <motion.div
              ref={filterRef}
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full mt-2.5 sm:mt-3 left-0 md:left-1/2 md:-translate-x-1/2 z-50 w-[92vw] max-w-[340px] select-none"
            >
              <LayoutGroup id="inputFilterLayoutGroup">
                <div className="w-full bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-black/10 flex flex-col gap-4 sm:gap-5 select-none">
                  {/* Mobile Search input inside dropdown */}
                  <div className="md:hidden flex items-center bg-[#f0f0f0]/80 rounded-2xl px-3 py-2 gap-2">
                    <FiSearch className="text-mud/50 text-sm shrink-0" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-mud text-[14px] font-jetreg outline-none placeholder:text-mud/40"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-mud/40 hover:text-mud font-jetreg px-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {/* color sec */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="text-mud text-[14px] sm:text-[15px] font-jetreg font-medium">
                        Color
                      </h3>
                      {selectedColor && (
                        <button
                          type="button"
                          onClick={() => setSelectedColor(null)}
                          className="text-[12px] font-jetreg text-mud/50 hover:text-mud cursor-pointer underline underline-offset-2"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="bg-[#f0f0f0]/80 rounded-full p-2 sm:p-2.5 flex items-center justify-between gap-1 sm:gap-2">
                      {COLORS.map((color) => {
                        const isSelected = selectedColor === color.id;
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() =>
                              handleOptionClick(() =>
                                setSelectedColor(isSelected ? null : color.id)
                              )
                            }
                            className="relative w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full cursor-pointer flex items-center justify-center hover:ring-2 hover:ring-mud hover:ring-offset-1 transition-transform hover:scale-105 shrink-0"
                            style={{
                              backgroundColor: color.hex,
                              border: color.border ? "1.5px solid #d1d5db" : "none",
                            }}
                          >
                            {isSelected && (
                              <FiCheck
                                strokeWidth={3}
                                className={`text-xs ${
                                  color.id === "white"
                                    ? "text-gray-900"
                                    : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* filtering sec */}
                  <div>
                    <h3 className="text-mud text-[14px] sm:text-[15px] font-jetreg font-medium mb-2.5">
                      Filter
                    </h3>
                    <div className="bg-[#f0f0f0]/80 rounded-full p-1 sm:p-1.5 flex items-center justify-between relative">
                      {FILTER_OPTIONS.map((filter) => {
                        const isActive = selectedFilter === filter;
                        return (
                          <button
                            key={filter}
                            type="button"
                            onClick={() =>
                              handleOptionClick(() => setSelectedFilter(filter))
                            }
                            className={`relative flex-1 py-1.5 sm:py-2 text-[13px] sm:text-[14px] font-jetreg text-center transition-colors duration-150 cursor-pointer ${
                              isActive
                                ? "text-mud font-semibold"
                                : "text-gray-400 font-normal hover:text-mud/70"
                            }`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activeFilterTab"
                                className="absolute inset-0 bg-white rounded-full shadow-sm"
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 32,
                                }}
                              />
                            )}
                            <span className="relative z-10">{filter}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </LayoutGroup>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
