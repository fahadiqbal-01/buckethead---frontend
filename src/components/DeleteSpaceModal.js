"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FiTrash2, FiX } from "react-icons/fi";

export default function DeleteSpaceModal({
  isOpen,
  spaceName,
  onClose,
  onConfirm,
  loading = false,
}) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 isolate">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        aria-hidden="true"
      />

      {/* Floating Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[360px] bg-white rounded-[32px] p-6 shadow-2xl border border-black/10 flex flex-col gap-4 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
              <FiTrash2 className="text-lg" />
            </div>
            <div>
              <h2 className="text-[17px] font-jetbold text-mud leading-snug">
                Delete Space?
              </h2>
              <p className="text-[12px] font-jetreg text-mud/50">
                This action cannot be undone
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-mud/40 hover:text-mud p-1 rounded-full hover:bg-mud/10 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <FiX className="text-base" />
          </button>
        </div>

        <p className="text-[13px] font-jetreg text-mud/80 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-jetbold text-mud">
            &ldquo;{spaceName}&rdquo;
          </span>
          ? Your items will not be deleted, only the space will be removed.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 rounded-full font-jetreg text-[13px] text-mud/70 hover:text-mud hover:bg-mud/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-5 py-2 rounded-full font-jetbold text-[13px] bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
