"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiPlus, FiX, FiTrash2 } from "react-icons/fi";

export default function SpaceMenuPopover({
  isOpen,
  onClose,
  item,
  spaces = [],
  onToggleSpace,
  onCreateSpaceClick,
  onDeleteSpace,
  targetRect,
}) {
  const popoverRef = useRef(null);
  const [togglingFolder, setTogglingFolder] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const handleSpaceToggle = async (folderName, itemId) => {
    if (togglingFolder) return;
    setTogglingFolder(folderName);
    try {
      await onToggleSpace?.(folderName, itemId);
    } finally {
      setTogglingFolder(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 isolate">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        aria-hidden="true"
      />

      <motion.div
        ref={popoverRef}
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-[280px] bg-white rounded-3xl p-4 md:p-5 shadow-2xl border border-black/10 flex flex-col gap-2.5 select-none overflow-hidden"
      >
        <div className="flex items-center justify-between pb-2 border-b border-black/5">
          <span className="text-[13px] font-jetbold text-mud">
            Add to Space
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className="text-mud/50 hover:text-mud p-1 rounded-full hover:bg-mud/10 transition-colors"
          >
            <FiX className="text-sm" />
          </button>
        </div>

        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto no-scrollbar py-1">
          {spaces.length === 0 ? (
            <div className="py-4 text-center text-[12px] text-mud/60 font-jetreg">
              No spaces yet
            </div>
          ) : (
            spaces.map((space) => {
              const isAssigned = space.post_ids?.includes(String(item.id));
              const isTogglingThis = togglingFolder === space.folder_name;

              return (
                <button
                  key={space.folder_name}
                  type="button"
                  disabled={Boolean(togglingFolder)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpaceToggle(space.folder_name, item.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 ${
                    Boolean(togglingFolder)
                      ? "cursor-wait opacity-80"
                      : "cursor-pointer"
                  } ${
                    isAssigned
                      ? "bg-mud/10 text-mud font-semibold"
                      : "hover:bg-mud/5 text-mud/80 hover:text-mud font-normal"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border border-black/15 shadow-2xs"
                      style={{
                        backgroundColor: space.folder_color || "#fffff3",
                      }}
                    />
                    <span className="text-[13px] font-jetreg truncate">
                      {space.folder_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {isTogglingThis ? (
                      <span className="w-3.5 h-3.5 border-2 border-mud/30 border-t-mud rounded-full animate-spin shrink-0" />
                    ) : isAssigned ? (
                      <FiCheck
                        strokeWidth={3}
                        className="text-mud text-sm shrink-0"
                      />
                    ) : null}
                    {onDeleteSpace && (
                      <span
                        role="button"
                        title={`Delete space "${space.folder_name}"`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSpace(space.folder_name);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-1 rounded-full hover:bg-mud/10 transition-all text-mud/40"
                      >
                        <FiTrash2 className="text-xs" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {onCreateSpaceClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
              onCreateSpaceClick?.();
            }}
            className="mt-1 pt-2 border-t border-black/5 flex items-center gap-2 px-2 py-1.5 text-[12px] font-jetreg text-mud/70 hover:text-mud hover:bg-mud/5 rounded-lg transition-colors cursor-pointer"
          >
            <FiPlus className="text-xs" />
            <span>Create new space</span>
          </button>
        )}
      </motion.div>
    </div>
  );
}
