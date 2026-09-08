"use client";
import React from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { FiCheck } from "react-icons/fi";

const COLORS = [
  { id: "white", hex: "#fffff3" },
  { id: "blue", hex: "#bfdbfe" },
  { id: "yellow", hex: "#fff085" },
  { id: "pink", hex: "#fccfe9" },
  { id: "orange", hex: "#ffd7a7" },
  { id: "red", hex: "#ffa3a2" },
  { id: "mud", hex: "#1d1919" },
];

const FILTER_OPTIONS = ["All", "Links", "Images", "Notes"];
const SORT_OPTIONS = ["Last edited", "Date created"];

export default function InputFiltering({
  inputRef,
  filterRef,
  openFilter,
  setOpenFilter,
  setOpenDrawer,
  selectedColor,
  setSelectedColor,
  selectedFilter,
  setSelectedFilter,
  selectedSort,
  setSelectedSort,
}) {
  const handleOptionClick = (action) => {
    action();
    if (setOpenDrawer) setOpenDrawer(false);
  };

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
            className="fixed inset-0 bg-mud/35 z-50 transition-opacity duration-150"
          />
        )}
      </AnimatePresence>

      <div className="absolute left-[50%] top-0.5 translate-x-[-50%] flex flex-col items-center z-50">
        <input
          ref={inputRef}
          type="text"
          placeholder="Find your item..."
          onFocus={() => handleOptionClick(() => setOpenFilter(true))}
          onClick={() => handleOptionClick(() => setOpenFilter(true))}
          suppressHydrationWarning
          className="border-2 border-transparent text-center text-white text-[18px] font-jetreg rounded-full bg-mud px-2 py-2 placeholder:text-white focus:bg-transparent focus:placeholder:text-mud placeholder:select-none focus:border-mud focus:text-mud duration-300 ease-out"
        />

        <AnimatePresence>
          {openFilter && (
            <motion.div
              ref={filterRef}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="pt-8 flex justify-center items-center w-max min-w-85"
            >
              <LayoutGroup id="inputFilterLayoutGroup">
                <div className="w-full bg-white rounded-3xl p-5 shadow-xl border border-black/10 flex flex-col gap-5 select-none">
                  {/* color sec */}
                  <div>
                    <h3 className="text-mud text-[15px] font-jetreg font-medium mb-3">
                      Color
                    </h3>
                    <div className="bg-[#f0f0f0]/80 rounded-full p-2.5 flex items-center justify-between gap-2">
                      {COLORS.map((color) => {
                        const isSelected = selectedColor === color.id;
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() =>
                              handleOptionClick(() =>
                                setSelectedColor(isSelected ? null : color.id),
                              )
                            }
                            className="relative w-6 h-6 rounded-full cursor-pointer flex items-center justify-center hover:ring-2 hover:ring-mud hover:ring-offset-1"
                            style={{ backgroundColor: color.hex }}
                          >
                            {isSelected && (
                              <FiCheck
                                strokeWidth={3}
                                className="text-white text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* filtering sec */}
                  <div>
                    <h3 className="text-mud text-[15px] font-jetreg font-medium mb-3">
                      Filter
                    </h3>
                    <div className="bg-[#f0f0f0]/80 rounded-full p-1.5 flex items-center justify-between relative">
                      {FILTER_OPTIONS.map((filter) => {
                        const isActive = selectedFilter === filter;
                        return (
                          <button
                            key={filter}
                            type="button"
                            onClick={() =>
                              handleOptionClick(() => setSelectedFilter(filter))
                            }
                            className={`relative flex-1 py-2 text-[14px] font-jetreg text-center transition-colors duration-150 cursor-pointer ${
                              isActive
                                ? "text-mud font-semibold"
                                : "text-gray-400 font-normal"
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

                  {/* sort sec */}
                  <div>
                    <h3 className="text-mud text-[15px] font-jetreg font-medium mb-3">
                      Sort
                    </h3>
                    <div className="bg-[#f0f0f0]/80 rounded-full p-1.5 flex items-center justify-between relative">
                      {SORT_OPTIONS.map((sort) => {
                        const isActive = selectedSort === sort;
                        return (
                          <button
                            key={sort}
                            type="button"
                            onClick={() =>
                              handleOptionClick(() => setSelectedSort(sort))
                            }
                            className={`relative flex-1 py-2.5 text-[14px] font-jetreg text-center transition-colors duration-150 cursor-pointer ${
                              isActive
                                ? "text-mud font-semibold"
                                : "text-gray-400 font-normal"
                            }`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activeSortTab"
                                className="absolute inset-0 bg-white rounded-full shadow-sm"
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 32,
                                }}
                              />
                            )}
                            <span className="relative z-10">{sort}</span>
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
