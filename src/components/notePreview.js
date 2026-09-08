"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuX, LuDownload, LuTrash2 } from "react-icons/lu";

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
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}) {
  const [selectedColor, setSelectedColor] = useState(note?.color || "white");

  useEffect(() => {
    if (note?.color) {
      setSelectedColor(note.color);
    }
  }, [note]);

  const handleClose = useCallback(() => {
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

  if (!isOpen || !note) return null;

  const title =
    note.node_title || note.title || note.name || note.text || "Untitled Note";
  const content = note.note_text || note.content || "";
  const timeString = formatTimeAgo(
    note.created_at || note.createdAt || note.date,
  );
  const currentColorHex = resolveColor(selectedColor);
  const isDark = selectedColor === "mud" || currentColorHex === "#1d1919";

  const handleColorSelect = (colorId) => {
    setSelectedColor(colorId);
    onColorChange?.(note.id, colorId);
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
          className="relative z-10 w-full max-w-135 bg-white rounded-[36px] p-6 md:p-7 shadow-2xl flex flex-col gap-4 select-none overflow-hidden"
        >
          {/* Top Navigation & Controls Header */}
          <div className="flex items-center justify-between shrink-0">
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

          {/* Inner Note Content Box */}
          <div
            style={{ backgroundColor: currentColorHex }}
            className={`w-full rounded-[28px] p-7 md:p-8 flex flex-col justify-between min-h-125 transition-colors duration-300 relative ${
              isDark ? "text-white" : "text-black"
            }`}
          >
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

              {/* Delete */}
              <button
                type="button"
                onClick={() => onDelete?.(note.id)}
                aria-label="Delete note"
                className="p-2 rounded-full hover:bg-red-500/10 text-red-500/80 hover:text-red-600 transition-colors cursor-pointer"
              >
                <LuTrash2 className="text-lg" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
