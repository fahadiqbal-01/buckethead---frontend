"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const GridContext = createContext({
  gridSize: "medium", // 'medium' | 'small'
  setGridSize: () => {},
});

export function GridProvider({ children }) {
  const [gridSize, setGridSize] = useState("medium");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("buckethead_grid_size");
      if (saved === "small" || saved === "medium") {
        setGridSize(saved);
      }
    } catch (e) {
      console.warn("Could not read grid size from localStorage", e);
    }
  }, []);

  const changeGridSize = (size) => {
    setGridSize(size);
    try {
      localStorage.setItem("buckethead_grid_size", size);
    } catch (e) {
      console.warn("Could not save grid size to localStorage", e);
    }
  };

  return (
    <GridContext.Provider value={{ gridSize, setGridSize: changeGridSize }}>
      {children}
    </GridContext.Provider>
  );
}

export function useGrid() {
  return useContext(GridContext);
}
