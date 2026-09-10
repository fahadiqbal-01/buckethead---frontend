"use client";
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuX, LuDownload, LuTrash2, LuExternalLink } from "react-icons/lu";
import { FiPlus } from "react-icons/fi";
import { extractImageColors, getCachedColors } from "@/utils/extractColors";

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

const DEFAULT_PALETTE = ["#201213", "#73181f", "#b04043", "#e3a9a8", "#f1cdcb"];

export default function ImagePreview({
  isOpen,
  onClose,
  image,
  onDelete,
  onAddToSpace,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}) {
  const src =
    image?.image_url ||
    image?.photo_url ||
    image?.secure_url ||
    image?.url ||
    "/images/t.jpg";

  const [extractedData, setExtractedData] = useState(() => {
    return (
      getCachedColors(src) || {
        bgColor: "#f4f4f0",
        palette: DEFAULT_PALETTE,
      }
    );
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen || !src) return;

    const cached = getCachedColors(src);
    if (cached) {
      setExtractedData(cached);
      return;
    }

    let isMounted = true;
    extractImageColors(src).then((res) => {
      if (isMounted && res) {
        setExtractedData({
          bgColor: res.bgColor || "#f4f4f0",
          palette: res.palette?.length ? res.palette : DEFAULT_PALETTE,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, src]);

  const handleClose = useCallback(() => {
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
    image?.image_name ||
    image?.name ||
    image?.fileName ||
    image?.title ||
    "Untitled Image";
  const note = image?.image_note || image?.note || "";
  const timeString = formatTimeAgo(
    image?.created_at || image?.createdAt || image?.date,
  );

  const handleDownload = async () => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "image"}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(src, "_blank");
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete?.(image);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && image && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 isolate">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[3px] transition-opacity"
            aria-hidden="true"
          />

          {/* Outer 2-Column Modal Canvas with Dynamic Extracted Background Color */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ backgroundColor: extractedData.bgColor }}
            className="relative z-10 w-full max-w-[1240px] h-[88vh] max-h-[820px] rounded-[36px] p-5 md:p-6 shadow-2xl flex flex-col lg:flex-row gap-5 select-none overflow-hidden transition-colors duration-500"
          >
            {/* LEFT: Media Canvas Stage */}
            <div className="flex-1 flex flex-col justify-between relative overflow-hidden h-full">
              {/* Top Navigation Bar inside stage */}
              <div className="flex items-center justify-between z-20 shrink-0">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close preview"
                  className="w-9 h-9 rounded-full bg-white hover:bg-black/5 border border-black/10 flex items-center justify-center cursor-pointer text-black transition-colors shadow-sm"
                >
                  <LuX className="text-lg" />
                </button>
              </div>

              {/* Central Main Image Container */}
              <div className="flex-1 flex items-center justify-center p-2 md:p-6 relative overflow-hidden">
                <div className="relative max-h-full max-w-full flex items-center justify-center rounded-[24px] overflow-hidden group">
                  <img
                    src={src}
                    alt={title}
                    crossOrigin="anonymous"
                    className="max-h-[58vh] max-w-full object-contain rounded-[20px] shadow-sm block"
                  />
                </div>
              </div>

              {/* Bottom Sub-bar under image */}
              <div className="w-full flex items-center justify-center px-4 pb-2 z-10">
                <div className="w-full max-w-md bg-white/40 backdrop-blur-md rounded-xl px-4 py-2 flex items-center justify-between text-black/80 border border-white/30 text-sm font-jetreg">
                  <span className="truncate pr-2">{title}</span>
                  <button
                    type="button"
                    onClick={() => window.open(src, "_blank")}
                    aria-label="Open full image"
                    className="hover:text-black transition-colors cursor-pointer"
                  >
                    <LuExternalLink className="text-base shrink-0" />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: Details Sidebar Panel */}
            <div className="w-full lg:w-[350px] shrink-0 bg-white/40 backdrop-blur-md rounded-[28px] p-6 md:p-7 flex flex-col justify-between border border-white/40 h-full overflow-hidden">
              {/* Top Details */}
              <div className="flex flex-col">
                {/* Title */}
                <h2 className="text-2xl font-bold font-jetbold tracking-tight text-black leading-snug break-words">
                  {title}
                </h2>

                {/* Timestamp */}
                <p className="text-sm font-jetreg text-black/50 mt-1.5">
                  {timeString}
                </p>

                {/* Dynamic Extracted Palette Dots */}
                <div className="flex items-center gap-2 mt-4">
                  {extractedData.palette.map((hex, i) => (
                    <span
                      key={i}
                      style={{ backgroundColor: hex }}
                      className="w-5 h-5 rounded-full border border-black/10 shadow-xs transition-transform duration-200 hover:scale-110"
                    />
                  ))}
                </div>

                {/* Note Heading */}
                <p className="text-sm font-semibold font-jetreg text-black/40 mt-6">
                  Note
                </p>

                {/* Note Content */}
                <div className="mt-2 text-[14px] font-normal font-jetreg text-black/80 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto pr-1 thin-scrollbar">
                  {note || (
                    <span className="text-black/40 italic">
                      Type here to add some thoughts...
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions Toolbar */}
              <div className="flex items-center justify-between pt-5 mt-6 border-t border-black/10 text-black/70">
                {/* Download */}
                <button
                  type="button"
                  onClick={handleDownload}
                  aria-label="Download image"
                  className="p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer hover:text-black"
                >
                  <LuDownload className="text-lg" />
                </button>

                {/* Add to space */}
                {onAddToSpace && (
                  <button
                    type="button"
                    onClick={(e) => onAddToSpace(e, image)}
                    aria-label="Add to space"
                    className="px-3.5 py-1.5 rounded-full hover:bg-black/5 active:scale-95 transition-all cursor-pointer text-[12px] font-jetreg flex items-center gap-1.5 border border-black/15 text-black/80 hover:text-black hover:border-black/30 shadow-xs"
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
                  aria-label="Delete image"
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
