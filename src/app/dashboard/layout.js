"use client";
import Container from "@/components/container";
import AddItemModal from "@/components/AddItemModal";
import InputFiltering from "@/components/inputfiltering";
import { AnimatePresence, easeOut, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { BsGrid3X2 } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";
import { useSilentRefresh } from "@/hooks/useSilentRefresh";
import { GridProvider, useGrid } from "@/context/GridContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.12,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

function DashboardLayoutContent({ children }) {
  useSilentRefresh();

  const { gridSize, setGridSize } = useGrid();
  const drawerRef = useRef(null);
  const buttonRef = useRef(null);
  const filterRef = useRef(null);
  const inputRef = useRef(null);

  const [openDrawer, setOpenDrawer] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  const router = useRouter();

  const handleOpenDrawer = () => {
    setOpenDrawer((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openDrawer &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setOpenDrawer(false);
      }

      if (
        openFilter &&
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setOpenFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDrawer, openFilter]);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Last edited");

  const handleSettings = (event) => {
    event?.stopPropagation();
    setOpenDrawer(false);
    setTimeout(() => {
      router.push("/settings");
    }, 600);
  };
  const handleSmallGrid = (event) => {
    event?.stopPropagation();
    setGridSize("small");
    setOpenDrawer(false);
  };
  const HandleMediumGrid = (event) => {
    event?.stopPropagation();
    setGridSize("medium");
    setOpenDrawer(false);
  };

  return (
    <div className="relative">
      <nav className="p-4 pb-16 relative z-50 border-b/80 bg-white">
        <Container className=" flex flex-row justify-between items-center relative">
          <Link href="/">
            <h1 className="text-4xl text-mud font-striper absolute top-0 left-0 select-none cursor-pointer ">
              BucketHead
            </h1>
          </Link>

          <InputFiltering
            inputRef={inputRef}
            filterRef={filterRef}
            openFilter={openFilter}
            setOpenFilter={setOpenFilter}
            setOpenDrawer={setOpenDrawer}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            selectedSort={selectedSort}
            setSelectedSort={setSelectedSort}
          />
          <div className=" flex flex-row justify-center items-center gap-4 absolute top-0 right-0 duration-300 ease-out">
            <button
              onClick={() => setOpenAddModal(true)}
              className=" bg-mud p-3 rounded-full cursor-pointer select-none absolute -left-16 top-0"
            >
              <FaPlus className=" text-2xl text-white " />
            </button>

            <motion.div
              ref={buttonRef}
              initial={false}
              animate={{
                width: openDrawer ? 170 : 48,
                height: openDrawer ? "auto" : 48,
              }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="p-3 bg-mud select-none text-left overflow-hidden rounded-3xl min-h-[48px] flex flex-col justify-start items-start outline-4 outline-blue relative"
            >
              <AnimatePresence initial={false}>
                {!openDrawer ? (
                  <motion.button
                    initial={{ opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: easeOut }}
                    key="cat-button"
                    onClick={handleOpenDrawer}
                    className="absolute right-0 top-0 w-fit h-fit flex items-center justify-center cursor-pointer p-0 bg-transparent border-0 "
                  >
                    <img
                      src="/icons/cat.gif"
                      alt="Cat animation"
                      className="w-12 h-12 rounded-full bg-white object-cover"
                    />
                  </motion.button>
                ) : (
                  <motion.div
                    key="drawer-content"
                    ref={drawerRef}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-36.5 py-1 whitespace-nowrap overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col justify-start items-start gap-2">
                      <motion.div
                        onClick={handleSmallGrid}
                        variants={itemVariants}
                        className={`w-full p-2 flex justify-start items-start rounded-xl ${
                          gridSize === "small"
                            ? "bg-white/25"
                            : "hover:bg-white/20"
                        } duration-200 ease-out cursor-pointer`}
                      >
                        <div className="text-[14px] text-white font-jetreg flex flex-row justify-center items-center gap-2">
                          <img src="/icons/smallgrid.svg" className=" w-5 " />
                          Small Grid
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        onClick={HandleMediumGrid}
                        className={`w-full text-[14px] text-white font-jetreg flex flex-row justify-start items-center gap-2 p-2 rounded-xl ${
                          gridSize === "medium"
                            ? "bg-white/25"
                            : "hover:bg-white/20"
                        } duration-200 ease-out cursor-pointer`}
                      >
                        <img src="/images/biggrid.svg" className=" w-5 " />
                        Medium Grid
                      </motion.div>
                    </div>
                    <motion.div
                      variants={itemVariants}
                      onClick={handleSettings}
                      className="text-[14px] text-white font-jetreg flex flex-row justify-start items-center gap-2 mt-4 p-2 rounded-xl hover:bg-white/20 duration-200 ease-out cursor-pointer"
                    >
                      <img src="/icons/settings.svg" className=" w-5 " />
                      Settings
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </Container>
      </nav>

      {/* Add Item Modal Section */}
      <AddItemModal
        isOpen={openAddModal}
        onClose={() => setOpenAddModal(false)}
      />

      <div>{children}</div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <GridProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </GridProvider>
  );
}
