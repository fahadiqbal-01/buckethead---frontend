"use client";
import React from "react";
import { FiPlus, FiX } from "react-icons/fi";

export default function Spaces({
  spaces = [],
  selectedSpace = null,
  onSelectSpace,
  onCreateSpaceClick,
  onDeleteSpace,
}) {
  const shortenText = (str, maxLength = 15) => {
    if (!str) return "";
    return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
  };

  const handleSpaceClick = (folderName) => {
    if (selectedSpace === folderName) {
      onSelectSpace?.(null); // toggle off to show all
    } else {
      onSelectSpace?.(folderName);
    }
  };

  return (
    <div className="w-full flex items-center gap-2 py-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none">
      {/* "All" button */}
      <button
        type="button"
        onClick={() => onSelectSpace?.(null)}
        className={`py-2 px-4 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer text-[14px] md:text-[16px] font-jetbold shrink-0 ${
          selectedSpace === null
            ? "bg-mud text-white shadow-md"
            : "bg-mud/10 text-mud hover:bg-mud/20"
        }`}
      >
        All
      </button>

      {/* Dynamic Space Tabs */}
      {spaces &&
        spaces.length > 0 &&
        spaces.map((space) => {
          const isSelected = selectedSpace === space.folder_name;
          return (
            <div
              key={space.folder_name}
              onClick={() => handleSpaceClick(space.folder_name)}
              className={`group/pill py-1.5 pl-3.5 pr-2 rounded-full flex items-center gap-2 transition-all duration-200 cursor-pointer text-[14px] md:text-[16px] font-jetbold shrink-0 ${
                isSelected
                  ? "bg-mud text-white shadow-md"
                  : "bg-mud/10 text-mud hover:bg-mud/20"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                style={{ backgroundColor: space.folder_color || "#fffff3" }}
              />
              <span>{shortenText(space.folder_name, 15)}</span>

              {onDeleteSpace && (
                <button
                  type="button"
                  title={`Delete space "${space.folder_name}"`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSpace(space.folder_name);
                  }}
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "text-white/60 hover:text-white hover:bg-white/20"
                      : "text-mud/40 hover:text-red-500 hover:bg-mud/10"
                  }`}
                >
                  <FiX className="text-xs stroke-[2.5]" />
                </button>
              )}
            </div>
          );
        })}

      {/* Quick Add Space Button */}
      {onCreateSpaceClick && (
        <button
          type="button"
          onClick={onCreateSpaceClick}
          title="Create New Space"
          className="w-9 h-9 rounded-full bg-mud/10 hover:bg-mud/20 text-mud flex items-center justify-center transition-colors duration-200 cursor-pointer shrink-0"
        >
          <FiPlus className="text-lg" />
        </button>
      )}
    </div>
  );
}
