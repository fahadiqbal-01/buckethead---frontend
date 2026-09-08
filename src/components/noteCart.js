"use client";
import React from "react";
import { motion } from "framer-motion";

const THEME_COLORS = {
  white: "#fffff3",
  blue: "#bfdbfe",
  yellow: "#fff085",
  pink: "#fccfe9",
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

export default function NoteCart({
  color = "white",
  text,
  title,
  content,
  size = "medium",
  className = "",
  onClick,
}) {
  const isSmall = size === "small";
  const bgColor = resolveColor(color);
  const isDark = color === "mud" || bgColor === "#1d1919";
  const isWhite = color === "white" || bgColor === "#fffff3";
  const displayText = text || title || "Untitled Note";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClick}
      style={{ backgroundColor: bgColor }}
      className={`w-full rounded-md cursor-zoom-in flex flex-col justify-between overflow-hidden relative transition-all duration-300 ease-out ${
        isSmall ? "max-h-36 min-h-24 p-3.5" : "max-h-48 min-h-32 p-5"
      } ${
        isWhite ? "border border-black/10 shadow-sm" : "shadow-sm"
      } ${isDark ? "text-white" : "text-mud"} ${className}`}
    >
      <h1
        className={`font-jetbold leading-snug break-words truncate transition-all duration-300 ease-out ${
          isSmall ? "text-[13px]" : "text-[17px]"
        }`}
      >
        {displayText}
      </h1>
      {content && (
        <p
          className={`font-jetreg leading-relaxed whitespace-pre-wrap break-all transition-all duration-300 ease-out ${
            isSmall
              ? "mt-1.5 text-[11px] line-clamp-3"
              : "mt-2 text-[14px] line-clamp-4"
          } ${isDark ? "text-white/80" : "text-mud/80"}`}
        >
          {content}
        </p>
      )}
    </motion.div>
  );
}
