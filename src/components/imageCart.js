"use client";
import React from "react";
import { LuImage } from "react-icons/lu";
import { FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";

const shortenText = (str, maxLength = 16) => {
  if (!str) return "";
  return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
};

export default function ImageCart({
  text = "hola como estas",
  src = "/images/t.jpg",
  height,
  maxHeight,
  aspectRatio,
  size = "medium",
  className = "",
  onClick,
  onAddClick,
}) {
  const isSmall = size === "small";
  const isExplicitSize =
    typeof height === "number" ||
    (typeof height === "string" &&
      (height.endsWith("px") ||
        height.endsWith("rem") ||
        height.endsWith("vh") ||
        height.endsWith("%")));

  const customStyle = {
    ...(isExplicitSize ? { height } : {}),
    ...(maxHeight ? { maxHeight } : {}),
    ...(aspectRatio && !aspectRatio.startsWith("aspect-")
      ? { aspectRatio }
      : {}),
  };

  const hasSpecificTailwindHeight =
    typeof height === "string" &&
    !isExplicitSize &&
    height.startsWith("h-") &&
    height !== "h-fit" &&
    height !== "h-auto";

  const tailwindHeightClass =
    typeof height === "string" && !isExplicitSize
      ? height
      : !isExplicitSize
        ? "h-fit"
        : "";

  const tailwindAspectClass =
    typeof aspectRatio === "string" && aspectRatio.startsWith("aspect-")
      ? aspectRatio
      : "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClick}
      style={Object.keys(customStyle).length > 0 ? customStyle : undefined}
      className={`w-full bg-black rounded-md overflow-hidden cursor-zoom-in group relative flex flex-col transition-all duration-300 ease-out ${tailwindHeightClass} ${tailwindAspectClass} ${className}`}
    >
      {onAddClick && (
        <button
          type="button"
          aria-label="Add to space"
          onClick={(e) => {
            e.stopPropagation();
            onAddClick(e);
          }}
          className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-mud shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <FiPlus className="text-sm stroke-[2.5]" />
        </button>
      )}
      <img
        src={src || "/images/t.jpg"}
        alt={text || "Image card"}
        loading="lazy"
        crossOrigin="anonymous"
        onError={(e) => {
          if (e.currentTarget.src !== "/images/t.jpg") {
            e.currentTarget.src = "/images/t.jpg";
          }
        }}
        className={`w-full ${
          isExplicitSize || hasSpecificTailwindHeight ? "h-full" : "h-auto"
        } object-cover group-hover:grayscale-50 duration-300 ease-out transition-all block`}
      />

      <div className="w-full flex justify-center items-center cursor-pointer">
        <p
          className={`w-full font-jetreg bg-black text-center flex flex-row justify-center items-center group-hover:text-white duration-300 ease-out text-white/70 ${
            isSmall ? "text-[11px] py-2 gap-2" : "text-[14px] py-3 gap-3"
          }`}
        >
          {shortenText(text, isSmall ? 12 : 16)}
          <LuImage className={isSmall ? "text-xs" : "text-base"} />
        </p>
      </div>
    </motion.div>
  );
}
