"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuX, LuDownload, LuTrash2 } from "react-icons/lu";
import { FiPlus } from "react-icons/fi";

export const COLOR_PALETTE = [
  { id: "white", hex: "#fffff3", border: true },
  { id: "pink", hex: "#fccfe9" },
  { id: "blue", hex: "#bfdbfe" },
  { id: "green", hex: "#86efac" },
  { id: "yellow", hex: "#fff085" },
  { id: "orange", hex: "#ffd7a7" },
  { id: "red", hex: "#ffa3a2" },
];

const THEME_COLORS = {
  white: "#fffff3",
  pink: "#fccfe9",
  blue: "#bfdbfe",
  green: "#86efac",
  yellow: "#fff085",
  orange: "#ffd7a7",
  red: "#ffa3a2",
  mud: "#1d1919",
};

const resolveColor = (color) => {
  if (!color) return THEME_COLORS.white;
  const key = String(color).toLowerCase().trim();
  if (THEME_COLORS[key]) return THEME_COLORS[key];
  if (key.startsWith("#")) return key;
  if (/^[0-9a-f]{3,8}$/i.test(key)) return "#" + key;
  return THEME_COLORS.white;
};

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return "Recently";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Recently";

  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"} ago`;

  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
};

export default function NotePreview({
  isOpen,
  onClose,
  note,
  onColorChange,
  onDelete,
  onAddToSpace,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [isColorUpdating, setIsColorUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const activeColor = selectedColor ?? note?.color ?? "white";

  const handleClose = useCallback(() => {
    setSelectedColor(null);
    setIsColorUpdating(false);
    setIsDeleting(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft" && onPrev && hasPrev) onPrev();
      if (e.key === "ArrowRight" && onNext && hasNext) onNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, onPrev, onNext, hasPrev, hasNext]);

  const title =
    note?.node_title ||
    note?.title ||
    note?.name ||
    note?.text ||
    "Untitled Note";
  const content = note?.note_text || note?.content || "";
  const timeString = formatTimeAgo(
    note?.created_at || note?.createdAt || note?.date,
  );
  const currentColorHex = resolveColor(activeColor);
  const isDark = activeColor === "mud" || currentColorHex === "#1d1919";

  const handleColorSelect = async (colorId) => {
    if (isColorUpdating || activeColor === colorId) return;
    setSelectedColor(colorId);
    setIsColorUpdating(true);
    try {
      if (note?.id) {
        await onColorChange?.(note.id, colorId);
      }
    } finally {
      setIsColorUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete?.(note);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([`${title}\n\n${content}`], {
      type: "text/plain;charset=utf-8",
    });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "note"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AnimatePresence>
      {isOpen && note && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 isolate">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
            aria-hidden="true"
          />

          {/* Outer Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 w-full max-w-135 bg-white rounded-[36px] p-6 md:p-4 shadow-2xl flex flex-col gap-4 select-none overflow-hidden"
          >
            {/* Inner Note Content Box */}
            <div
              style={{ backgroundColor: currentColorHex }}
              className={`w-full rounded-[28px] p-7 md:p-8 flex flex-col justify-between min-h-125 transition-colors duration-300 relative ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {/* close btn */}
              <div className="flex items-center justify-between shrink-0 absolute top-3 right-3">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close preview"
                  className="w-9 h-9 rounded-full bg-white hover:bg-black/5 border border-black/10 flex items-center justify-center cursor-pointer text-black transition-colors"
                >
                  <LuX className="text-lg" />
                </button>
              </div>

              {/* Top Details */}
              <div className="flex flex-col">
                {/* Title */}
                <h2 className="text-2xl md:text-[26px] font-bold font-jetbold tracking-tight leading-snug break-words">
                  {title}
                </h2>

                {/* Timestamp */}
                <p
                  className={`text-sm font-jetreg mt-1.5 ${
                    isDark ? "text-white/60" : "text-black/50"
                  }`}
                >
                  {timeString}
                </p>

                {/* Dynamic Theme Color Dots */}
                <div className="flex items-center gap-2 mt-4">
                  {COLOR_PALETTE.map((col) => {
                    const isSelected = activeColor === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        disabled={isColorUpdating}
                        onClick={() => handleColorSelect(col.id)}
                        style={{ backgroundColor: col.hex }}
                        aria-label={`Select color ${col.id}`}
                        className={`w-5 h-5 rounded-full border border-black/15 shadow-xs transition-transform duration-200 hover:scale-110 flex items-center justify-center ${
                          isColorUpdating ? "cursor-wait" : "cursor-pointer"
                        } ${
                          isSelected
                            ? "ring-2 ring-black/40 ring-offset-1 scale-110"
                            : ""
                        }`}
                      >
                        {isSelected && isColorUpdating && (
                          <span className="w-2.5 h-2.5 border border-black/40 border-t-black rounded-full animate-spin" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Section Heading: Note */}
                <p
                  className={`text-sm font-semibold font-jetreg mt-6 ${
                    isDark ? "text-white/50" : "text-black/40"
                  }`}
                >
                  Note
                </p>

                {/* Note Content Text */}
                <div
                  className={`mt-2 text-[15px] font-normal font-jetreg leading-relaxed whitespace-pre-wrap break-words max-h-56 overflow-y-auto pr-2 ${
                    isDark
                      ? "text-white/90 thin-scrollbar-dark"
                      : "text-black/90 thin-scrollbar"
                  }`}
                >
                  {content || (
                    <span className="italic opacity-50">No text content</span>
                  )}
                </div>
              </div>

              {/* Bottom Actions Toolbar */}
              <div
                className={`flex items-center justify-between pt-6 mt-6 border-t ${
                  isDark
                    ? "border-white/10 text-white/70"
                    : "border-black/5 text-black/70"
                }`}
              >
                {/* Download */}
                <button
                  type="button"
                  onClick={handleDownload}
                  aria-label="Download note"
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer hover:text-black dark:hover:text-white"
                >
                  <LuDownload className="text-lg" />
                </button>

                {/* Add to space */}
                {onAddToSpace && (
                  <button
                    type="button"
                    onClick={(e) => onAddToSpace(e, note)}
                    aria-label="Add to space"
                    className={`px-3.5 py-1.5 rounded-full active:scale-95 transition-all cursor-pointer text-[12px] font-jetreg flex items-center gap-1.5 border shadow-xs ${
                      isDark
                        ? "hover:bg-white/10 text-white/80 hover:text-white border-white/20 hover:border-white/40"
                        : "hover:bg-black/5 text-black/80 hover:text-black border-black/15 hover:border-black/30"
                    }`}
                  >
                    <FiPlus className="text-sm stroke-[2.5]" />
                    <span>Add to space</span>
                  </button>
                )}

                {/* Delete */}
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-label="Delete note"
                  className="p-2 rounded-full hover:bg-red-500/10 text-red-500/80 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <span className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin inline-block" />
                  ) : (
                    <LuTrash2 className="text-lg" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
