"use client";
import React from "react";
import { LuUnlink } from "react-icons/lu";
import { motion } from "framer-motion";

const shortenText = (str, maxLength = 16) => {
  if (!str) return "";
  return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
};

export default function LinkCart({
  text = "Hola como estas",
  src = "/images/bg.jpg",
  href = "#",
  height,
  maxHeight,
  aspectRatio,
  size = "medium",
  className = "",
  onClick,
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
      <img
        src={src || "/images/t.jpg"}
        alt={text || "Link preview"}
        className={`w-full ${
          isExplicitSize || hasSpecificTailwindHeight ? "h-full" : "h-auto"
        } object-cover group-hover:grayscale-50 duration-300 ease-out transition-all block`}
      />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex justify-center items-center cursor-pointer"
      >
        <p
          className={`w-full font-jetreg bg-black text-center flex flex-row justify-center items-center group-hover:text-white duration-300 ease-out text-white/70 ${
            isSmall ? "text-[11px] py-2 gap-2" : "text-[14px] py-3 gap-3"
          }`}
        >
          {shortenText(text, isSmall ? 12 : 16)}
          <LuUnlink className={isSmall ? "text-xs" : "text-base"} />
        </p>
      </a>
    </motion.div>
  );
}
