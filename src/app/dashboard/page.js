"use client";
import React, { useEffect, useState, useMemo } from "react";
import Container from "@/components/container";
import ImageCart from "@/components/imageCart";
import LinkCart from "@/components/linkCart";
import NoteCart from "@/components/noteCart";
import ImagePreview from "@/components/imagePreview";
import LinkPreview from "@/components/linkPreview";
import NotePreview from "@/components/notePreview";
import Spaces from "@/components/spaces";
import SpaceMenuPopover from "@/components/SpaceMenuPopover";
import DeleteSpaceModal from "@/components/DeleteSpaceModal";
import { authFetch } from "@/utils/authFetch";
import { useFilter } from "@/context/FilterContext";
import { useGrid } from "@/context/GridContext";
import { motion, AnimatePresence, easeInOut, easeOut } from "framer-motion";
import { extractImageColors } from "@/utils/extractColors";

export default function DashboardPage() {
  const { gridSize } = useGrid();
  const isSmall = gridSize === "small";

  const { searchQuery, selectedColor, selectedFilter } = useFilter();

  const CACHE_KEY = "buckethead_posts_cache";
  const SPACES_CACHE_KEY = "buckethead_spaces_cache";

  const [items, setItems] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPreviewItem, setSelectedPreviewItem] = useState(null);
  const [spacePopover, setSpacePopover] = useState({
    isOpen: false,
    item: null,
    targetRect: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    spaceName: "",
    loading: false,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

  const preloadCartImages = async (itemsList) => {
    if (
      typeof window === "undefined" ||
      !Array.isArray(itemsList) ||
      itemsList.length === 0
    ) {
      return;
    }

    const imageUrls = itemsList
      .map((it) => {
        if (it.post_type === "image" || it.itemType === "image") {
          return it.image_url || it.photo_url || it.secure_url || it.url;
        }
        if (it.post_type === "link" || it.itemType === "link") {
          return it.image_url || it.photo_url || it.src;
        }
        return null;
      })
      .filter(Boolean);

    if (imageUrls.length === 0) return;

    const loadPromises = imageUrls.slice(0, 15).map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          extractImageColors(src).catch(() => {});
          resolve();
        };
        img.onerror = resolve;
        img.src = src;
      });
    });

    await Promise.race([
      Promise.all(loadPromises),
      new Promise((res) => setTimeout(res, 1200)),
    ]);
  };

  const loadAllDashboardData = async () => {
    setLoading(true);

    try {
      const [postsRes, spacesRes] = await Promise.allSettled([
        authFetch(`${API_URL}/getallposts`, { method: "GET" }),
        authFetch(`${API_URL}/getspaces`, { method: "GET" }),
      ]);

      let freshItems = [];
      let freshSpaces = [];

      if (postsRes.status === "fulfilled" && postsRes.value.ok) {
        const data = await postsRes.value.json();
        freshItems = Array.isArray(data) ? data : [];
        setItems(freshItems);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(freshItems));
          } catch (e) {}
        }
      } else {
        if (typeof window !== "undefined") {
          try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed)) freshItems = parsed;
              setItems(freshItems);
            }
          } catch (e) {}
        }
      }

      if (spacesRes.status === "fulfilled" && spacesRes.value.ok) {
        const data = await spacesRes.value.json();
        freshSpaces = Array.isArray(data) ? data : [];
        setSpaces(freshSpaces);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(SPACES_CACHE_KEY, JSON.stringify(freshSpaces));
          } catch (e) {}
        }
      } else {
        if (typeof window !== "undefined") {
          try {
            const cached = localStorage.getItem(SPACES_CACHE_KEY);
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed)) freshSpaces = parsed;
              setSpaces(freshSpaces);
            }
          } catch (e) {}
        }
      }

      // Preload images completely before revealing carts
      if (freshItems.length > 0) {
        await preloadCartImages(freshItems);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSpaces = async () => {
    try {
      const response = await authFetch(`${API_URL}/getspaces`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        const freshSpaces = Array.isArray(data) ? data : [];
        setSpaces(freshSpaces);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(SPACES_CACHE_KEY, JSON.stringify(freshSpaces));
          } catch (e) {
            console.warn("Failed to cache spaces in localStorage", e);
          }
        }
      }
    } catch (err) {
      console.error("Error loading spaces:", err);
    }
  };

  useEffect(() => {
    loadAllDashboardData();

    const handleSpaceAdded = () => {
      loadSpaces();
    };

    window.addEventListener("space-created", handleSpaceAdded);
    window.addEventListener("space-added", handleSpaceAdded);

    const handleItemAdded = (event) => {
      const newItem = event?.detail;
      if (!newItem) return;

      let optimisticItem = null;

      if (newItem.type === "note" || newItem.node_title || newItem.note_text) {
        optimisticItem = {
          id: newItem.id || Date.now().toString(),
          post_type: "note",
          color: newItem.color || "white",
          node_title:
            newItem.node_title ||
            newItem.title ||
            newItem.text ||
            "Untitled Note",
          note_text: newItem.note_text || newItem.content || "",
          created_at: new Date().toISOString(),
        };
      } else if (newItem.type === "link" || newItem.link_url) {
        optimisticItem = {
          id: newItem.id || Date.now().toString(),
          post_type: "link",
          image_url: newItem.image_url || newItem.src || newItem.preview || "",
          link_name:
            newItem.link_name || newItem.title || newItem.text || "Link",
          link_url: newItem.link_url || newItem.url || newItem.href || "#",
          link_desc: newItem.link_desc || newItem.description || "",
          created_at: new Date().toISOString(),
        };
      } else if (
        newItem.type === "image" ||
        newItem.photo_url ||
        newItem.image_url
      ) {
        optimisticItem = {
          id: newItem.id || Date.now().toString(),
          post_type: "image",
          image_url: newItem.photo_url || newItem.image_url || newItem.preview,
          image_name:
            newItem.name ||
            newItem.image_name ||
            newItem.fileName ||
            "Uploaded Photo",
          image_note: newItem.note || newItem.image_note || "",
          created_at: new Date().toISOString(),
        };
      }

      if (optimisticItem) {
        setItems((prev) => {
          const updated = [
            optimisticItem,
            ...prev.filter((it) => it.id !== optimisticItem.id),
          ];
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
            } catch (e) {}
          }
          return updated;
        });
      }
    };

    window.addEventListener("item-added", handleItemAdded);
    return () => {
      window.removeEventListener("item-added", handleItemAdded);
      window.removeEventListener("space-created", handleSpaceAdded);
      window.removeEventListener("space-added", handleSpaceAdded);
    };
  }, []);

  // Filter and Sort items dynamically
  const filteredAndSortedItems = useMemo(() => {
    const isFiltering =
      (searchQuery && searchQuery.trim() !== "") ||
      (selectedFilter && selectedFilter !== "All") ||
      Boolean(selectedColor);

    let result = [...items];

    // If no global filter is active and a space is selected, filter items by space
    if (!isFiltering && selectedSpace) {
      const activeSpaceObj = spaces.find(
        (s) => s.folder_name === selectedSpace,
      );
      const spaceItemIds = new Set(activeSpaceObj?.post_ids || []);
      result = result.filter((item) => spaceItemIds.has(String(item.id)));
    }

    // 1. Search Query Filter (filters across all user items when filtering)
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const title = (
          item.node_title ||
          item.title ||
          item.image_name ||
          item.name ||
          item.link_name ||
          ""
        ).toLowerCase();
        const desc = (
          item.note_text ||
          item.content ||
          item.image_note ||
          item.note ||
          item.link_desc ||
          item.description ||
          ""
        ).toLowerCase();
        const url = (item.link_url || item.url || "").toLowerCase();
        return title.includes(q) || desc.includes(q) || url.includes(q);
      });
    }

    // 2. Type Filter (All, Links, Images, Notes)
    if (selectedFilter && selectedFilter !== "All") {
      if (selectedFilter === "Links") {
        result = result.filter(
          (it) => it.post_type === "link" || it.itemType === "link",
        );
      } else if (selectedFilter === "Images") {
        result = result.filter(
          (it) => it.post_type === "image" || it.itemType === "image",
        );
      } else if (selectedFilter === "Notes") {
        result = result.filter(
          (it) => it.post_type === "note" || it.itemType === "note",
        );
      }
    }

    // 3. Color Filter
    if (selectedColor) {
      const targetColor = selectedColor.toLowerCase();
      result = result.filter((item) => {
        if (item.color) {
          return item.color.toLowerCase() === targetColor;
        }
        return false;
      });
    }

    // 4. Sort (Last edited / Date created)
    result.sort((a, b) => {
      const timeA = new Date(
        a.created_at || a.createdAt || a.id || 0,
      ).getTime();
      const timeB = new Date(
        b.created_at || b.createdAt || b.id || 0,
      ).getTime();

      if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
        return timeB - timeA; // newest first
      }

      const idA = String(a.id || "");
      const idB = String(b.id || "");
      return idB.localeCompare(idA, undefined, { numeric: true });
    });

    return result;
  }, [
    items,
    searchQuery,
    selectedFilter,
    selectedColor,
    selectedSpace,
    spaces,
  ]);

  // Active Index & Navigation for Preview
  const activeIndex = useMemo(() => {
    if (!selectedPreviewItem) return -1;
    return filteredAndSortedItems.findIndex((it) =>
      it.id && selectedPreviewItem.id
        ? it.id === selectedPreviewItem.id
        : it === selectedPreviewItem,
    );
  }, [selectedPreviewItem, filteredAndSortedItems]);

  const hasPrev = activeIndex > 0;
  const hasNext =
    activeIndex >= 0 && activeIndex < filteredAndSortedItems.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setSelectedPreviewItem(filteredAndSortedItems[activeIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setSelectedPreviewItem(filteredAndSortedItems[activeIndex + 1]);
    }
  };

  const handleDeleteItem = async (itemOrId, explicitType) => {
    let itemId =
      typeof itemOrId === "object" && itemOrId !== null
        ? itemOrId.id
        : itemOrId;
    let postType =
      explicitType ||
      (typeof itemOrId === "object" && itemOrId !== null
        ? itemOrId.post_type || itemOrId.itemType || itemOrId.type
        : null);

    if (!postType && selectedPreviewItem) {
      postType =
        selectedPreviewItem.post_type ||
        selectedPreviewItem.itemType ||
        selectedPreviewItem.type;
    }

    if (!postType) {
      const found = items.find((it) => String(it.id) === String(itemId));
      postType = found?.post_type || found?.itemType || found?.type;
    }

    if (!postType) {
      postType = "note";
    }

    postType = String(postType).toLowerCase();

    // Smooth delay so the preview modal's delete spinner is clearly visible
    await new Promise((res) => setTimeout(res, 450));

    // Close preview modal
    setSelectedPreviewItem(null);

    // Optimistically update local state & cache
    setItems((prev) => {
      const updated = prev.filter((it) => String(it.id) !== String(itemId));
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to update cache after delete", e);
        }
      }
      return updated;
    });

    try {
      const response = await authFetch(
        `${API_URL}/deletepost/${postType}/${itemId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        console.error(
          "Failed to delete post on backend:",
          response.status,
          await response.text(),
        );
      }
    } catch (err) {
      console.error("Network error deleting post:", err);
    }
  };

  const handleColorChange = async (noteId, newColor) => {
    // Artificial smooth delay to provide loading feedback and rate limit rapid color switching
    await new Promise((res) => setTimeout(res, 350));

    setItems((prev) => {
      const updated = prev.map((it) => {
        if (it.id === noteId) {
          return { ...it, color: newColor };
        }
        return it;
      });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to update cache after color change", e);
        }
      }
      return updated;
    });

    if (selectedPreviewItem && selectedPreviewItem.id === noteId) {
      setSelectedPreviewItem((prev) => ({ ...prev, color: newColor }));
    }

    try {
      const res = await authFetch(`${API_URL}/updatenotecolor/${noteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ color: newColor }),
      });
      if (!res.ok) {
        console.error("Failed to update note color on server:", res.status);
      }
    } catch (err) {
      console.error("Network error updating note color:", err);
    }
  };

  const handleOpenSpacePopover = (e, item) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setSpacePopover({
      isOpen: true,
      item,
      targetRect: rect,
    });
  };

  const handleToggleSpaceItem = async (folderName, itemId) => {
    const strItemId = String(itemId);
    const targetSpace = spaces.find((s) => s.folder_name === folderName);
    const isAssigned = Boolean(targetSpace?.post_ids?.includes(strItemId));

    // Small delay to show smooth loading feedback and rate limit rapid toggles
    await new Promise((res) => setTimeout(res, 400));

    // Optimistically update space post_ids
    setSpaces((prev) => {
      const updated = prev.map((s) => {
        if (s.folder_name === folderName) {
          const existing = s.post_ids || [];
          const nextIds = isAssigned
            ? existing.filter((id) => String(id) !== strItemId)
            : [...existing, strItemId];
          return { ...s, post_ids: nextIds };
        }
        return s;
      });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(SPACES_CACHE_KEY, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    try {
      const endpoint = isAssigned ? "/removefromspace" : "/addtospace";
      const res = await authFetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_name: folderName, post_id: strItemId }),
      });

      if (!res.ok) {
        console.error("Failed to toggle space item on backend:", res.status);
        loadSpaces();
      }
    } catch (err) {
      console.error("Network error toggling space item:", err);
      loadSpaces();
    }
  };

  const handleOpenCreateSpace = () => {
    setSpacePopover({ isOpen: false, item: null, targetRect: null });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-create-space"));
    }
  };

  const handleRequestDeleteSpace = (folderName) => {
    if (!folderName) return;
    setDeleteModal({
      isOpen: true,
      spaceName: folderName,
      loading: false,
    });
  };

  const handleConfirmDeleteSpace = async () => {
    const folderName = deleteModal.spaceName;
    if (!folderName) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));

    // Small delay so loading state and spinner are clearly shown
    await new Promise((res) => setTimeout(res, 500));

    // Optimistically remove space
    setSpaces((prev) => {
      const updated = prev.filter((s) => s.folder_name !== folderName);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(SPACES_CACHE_KEY, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    if (selectedSpace === folderName) {
      setSelectedSpace(null);
    }

    try {
      const res = await authFetch(
        `${API_URL}/deletespace/${encodeURIComponent(folderName)}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        console.error("Failed to delete space on backend:", res.status);
        loadSpaces();
      }
    } catch (err) {
      console.error("Network error deleting space:", err);
      loadSpaces();
    } finally {
      setDeleteModal({ isOpen: false, spaceName: "", loading: false });
    }
  };

  return (
    <Container className=" min-h-screen ">
        <Spaces
          spaces={spaces}
          selectedSpace={selectedSpace}
          onSelectSpace={setSelectedSpace}
          onCreateSpaceClick={handleOpenCreateSpace}
          onDeleteSpace={handleRequestDeleteSpace}
        />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="dashboard-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full py-36 flex flex-col items-center justify-center gap-3 select-none"
          >
            <div className="w-7 h-7 border-2 border-mud/20 border-t-mud rounded-full animate-spin" />
            <p className="text-[13px] text-mud/60 font-jetreg tracking-wide">
              Loading...
            </p>
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div
            key="dashboard-empty-welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full py-28 flex flex-col items-center justify-center text-center select-none"
          >
            <h2 className="text-[22px] md:text-4xl text-mud font-jetbold tracking-tight">
              Welcome
            </h2>
          </motion.div>
        ) : filteredAndSortedItems.length === 0 ? (
          <motion.div
            key="dashboard-filtered-empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full py-28 flex flex-col items-center justify-center text-center select-none"
          >
            <p className="text-[16px] text-mud/60 font-jetreg tracking-wide">
              No items found matching your filters.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`carts-grid-${selectedSpace || "all"}-${selectedFilter || "all"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{
              duration: 0.5,
              ease: easeInOut,
            }}
            className={`py-6 gap-6 [column-fill:_balance] select-none ${
              isSmall
                ? "columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-7"
                : "columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5"
            }`}
          >
            {filteredAndSortedItems.map((item, index) => {
              const key = item.id || `item-${index}`;

              return (
                <div
                  key={key}
                  className="break-inside-avoid mb-6 w-full flex justify-center"
                >
                  {item.post_type === "image" || item.itemType === "image" ? (
                    <ImageCart
                      src={
                        item.image_url ||
                        item.photo_url ||
                        item.secure_url ||
                        item.url
                      }
                      text={item.image_name || item.name || item.title || ""}
                      className="w-full"
                      onClick={() => setSelectedPreviewItem(item)}
                      onAddClick={(e) => handleOpenSpacePopover(e, item)}
                    />
                  ) : item.post_type === "link" || item.itemType === "link" ? (
                    <LinkCart
                      src={item.image_url || "/images/bg.jpg"}
                      text={item.link_name || item.title || ""}
                      href={item.link_url || "#"}
                      className="w-full"
                      onClick={() => setSelectedPreviewItem(item)}
                      onAddClick={(e) => handleOpenSpacePopover(e, item)}
                    />
                  ) : (
                    <NoteCart
                      color={item.color || "white"}
                      title={item.node_title || item.title || ""}
                      content={item.note_text || item.content || ""}
                      className="w-full"
                      onClick={() => setSelectedPreviewItem(item)}
                      onAddClick={(e) => handleOpenSpacePopover(e, item)}
                    />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modals */}
      <ImagePreview
        isOpen={
          Boolean(selectedPreviewItem) &&
          (selectedPreviewItem?.post_type === "image" ||
            selectedPreviewItem?.itemType === "image")
        }
        onClose={() => setSelectedPreviewItem(null)}
        image={selectedPreviewItem}
        onDelete={handleDeleteItem}
        onAddToSpace={(e, item) => handleOpenSpacePopover(e, item)}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      <LinkPreview
        isOpen={
          Boolean(selectedPreviewItem) &&
          (selectedPreviewItem?.post_type === "link" ||
            selectedPreviewItem?.itemType === "link")
        }
        onClose={() => setSelectedPreviewItem(null)}
        link={selectedPreviewItem}
        onDelete={handleDeleteItem}
        onAddToSpace={(e, item) => handleOpenSpacePopover(e, item)}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      <NotePreview
        isOpen={
          Boolean(selectedPreviewItem) &&
          (selectedPreviewItem?.post_type === "note" ||
            selectedPreviewItem?.itemType === "note")
        }
        onClose={() => setSelectedPreviewItem(null)}
        note={selectedPreviewItem}
        onColorChange={handleColorChange}
        onDelete={handleDeleteItem}
        onAddToSpace={(e, item) => handleOpenSpacePopover(e, item)}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      {/* Space Menu Popover */}
      <SpaceMenuPopover
        isOpen={spacePopover.isOpen}
        onClose={() =>
          setSpacePopover({ isOpen: false, item: null, targetRect: null })
        }
        item={spacePopover.item}
        spaces={spaces}
        onToggleSpace={handleToggleSpaceItem}
        onCreateSpaceClick={handleOpenCreateSpace}
        onDeleteSpace={handleRequestDeleteSpace}
        targetRect={spacePopover.targetRect}
      />

      {/* Delete Space Confirmation Modal */}
      <DeleteSpaceModal
        isOpen={deleteModal.isOpen}
        spaceName={deleteModal.spaceName}
        loading={deleteModal.loading}
        onClose={() =>
          setDeleteModal({ isOpen: false, spaceName: "", loading: false })
        }
        onConfirm={handleConfirmDeleteSpace}
      />
    </Container>
  );
}
