"use client";
import React, { useEffect, useState } from "react";
import Container from "@/components/container";
import ImageCart from "@/components/imageCart";
import LinkCart from "@/components/linkCart";
import NoteCart from "@/components/noteCart";
import NotePreview from "@/components/notePreview";
import ImagePreview from "@/components/imagePreview";
import LinkPreview from "@/components/linkPreview";
import Spaces from "@/components/spaces";
import { motion } from "framer-motion";
import { authFetch } from "@/utils/authFetch";
import { useGrid } from "@/context/GridContext";

export default function DashboardPage() {
  const { gridSize } = useGrid();
  const isSmall = gridSize === "small";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

  const loadAllData = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`${API_URL}/getallposts`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        console.warn("Session expired or unauthorized (401).");
      }
    } catch (err) {
      console.error("Error loading all posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id, postType) => {
    if (!id) return;
    try {
      // Optimistic delete from UI
      setItems((prev) => prev.filter((it) => it.id !== id && it._id !== id));
      setSelectedNote(null);
      setSelectedImage(null);
      setSelectedLink(null);

      // Secure authenticated DELETE request
      const res = await authFetch(`${API_URL}/deletepost/${postType}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Delete request failed:", res.status);
        loadAllData();
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      loadAllData();
    }
  };

  useEffect(() => {
    loadAllData();

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
        setItems((prev) => [
          optimisticItem,
          ...prev.filter((it) => it.id !== optimisticItem.id),
        ]);
      }
    };

    window.addEventListener("item-added", handleItemAdded);
    return () => window.removeEventListener("item-added", handleItemAdded);
  }, []);

  const imageItems = items.filter(
    (it) => it.post_type === "image" || it.itemType === "image",
  );
  const linkItems = items.filter(
    (it) => it.post_type === "link" || it.itemType === "link",
  );
  const noteItems = items.filter(
    (it) => it.post_type === "note" || it.itemType === "note",
  );

  return (
    <Container>
      <Spaces spacetitle="My Design Templet" />

      {!loading && (
        <div
          className={`py-6 select-none transition-all duration-300 ease-out [column-fill:_balance] ${
            isSmall
              ? "columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-7 gap-4"
              : "columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6"
          }`}
        >
          {items.map((item, index) => {
            const key = item.id || `item-${index}`;

            if (item.post_type === "image" || item.itemType === "image") {
              return (
                <div
                  key={key}
                  className={`break-inside-avoid w-full flex justify-center transition-all duration-300 ease-out ${
                    isSmall ? "mb-4" : "mb-6"
                  }`}
                >
                  <ImageCart
                    src={
                      item.image_url ||
                      item.photo_url ||
                      item.secure_url ||
                      item.url
                    }
                    text={item.image_name || item.name || item.title || ""}
                    size={gridSize}
                    className="w-full cursor-pointer"
                    onClick={() => setSelectedImage(item)}
                  />
                </div>
              );
            }

            if (item.post_type === "link" || item.itemType === "link") {
              return (
                <div
                  key={key}
                  className={`break-inside-avoid w-full flex justify-center transition-all duration-300 ease-out ${
                    isSmall ? "mb-4" : "mb-6"
                  }`}
                >
                  <LinkCart
                    src={item.image_url || "/images/bg.jpg"}
                    text={item.link_name || item.title || ""}
                    href={item.link_url || "#"}
                    size={gridSize}
                    className="w-full cursor-pointer"
                    onClick={() => setSelectedLink(item)}
                  />
                </div>
              );
            }

            if (item.post_type === "note" || item.itemType === "note") {
              return (
                <div
                  key={key}
                  className={`break-inside-avoid w-full flex justify-center transition-all duration-300 ease-out ${
                    isSmall ? "mb-4" : "mb-6"
                  }`}
                >
                  <NoteCart
                    color={item.color || "white"}
                    title={item.node_title || item.title || ""}
                    content={item.note_text || item.content || ""}
                    size={gridSize}
                    className="w-full cursor-pointer"
                    onClick={() => setSelectedNote(item)}
                  />
                </div>
              );
            }

            return null;
          })}

          {/* Fallback demo card if empty */}
          {items.length === 0 && (
            <div
              className={`break-inside-avoid w-full flex justify-center transition-all duration-300 ease-out ${
                isSmall ? "mb-4" : "mb-6"
              }`}
            >
              <NoteCart
                color="bfdbfe"
                title="Hello"
                content="Create your first item!"
                size={gridSize}
                className="w-full"
                onClick={() =>
                  setSelectedNote({
                    id: "demo",
                    color: "blue",
                    title: "Hello",
                    content: "Create your first item!",
                  })
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Note Preview Modal */}
      <NotePreview
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        note={selectedNote}
        onDelete={(id) => handleDeletePost(id, "note")}
        hasPrev={
          noteItems.findIndex(
            (n) => (n.id || n._id) === (selectedNote?.id || selectedNote?._id),
          ) > 0
        }
        hasNext={
          noteItems.findIndex(
            (n) => (n.id || n._id) === (selectedNote?.id || selectedNote?._id),
          ) <
          noteItems.length - 1
        }
        onPrev={() => {
          const idx = noteItems.findIndex(
            (n) => (n.id || n._id) === (selectedNote?.id || selectedNote?._id),
          );
          if (idx > 0) setSelectedNote(noteItems[idx - 1]);
        }}
        onNext={() => {
          const idx = noteItems.findIndex(
            (n) => (n.id || n._id) === (selectedNote?.id || selectedNote?._id),
          );
          if (idx >= 0 && idx < noteItems.length - 1)
            setSelectedNote(noteItems[idx + 1]);
        }}
        onColorChange={(noteId, newColor) => {
          setItems((prev) =>
            prev.map((it) =>
              it.id === noteId ? { ...it, color: newColor } : it,
            ),
          );
        }}
      />

      {/* Image Preview Modal */}
      <ImagePreview
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        image={selectedImage}
        onDelete={(id) => handleDeletePost(id, "image")}
        hasPrev={
          imageItems.findIndex(
            (img) =>
              (img.id || img._id) === (selectedImage?.id || selectedImage?._id),
          ) > 0
        }
        hasNext={
          imageItems.findIndex(
            (img) =>
              (img.id || img._id) === (selectedImage?.id || selectedImage?._id),
          ) <
          imageItems.length - 1
        }
        onPrev={() => {
          const idx = imageItems.findIndex(
            (img) =>
              (img.id || img._id) === (selectedImage?.id || selectedImage?._id),
          );
          if (idx > 0) setSelectedImage(imageItems[idx - 1]);
        }}
        onNext={() => {
          const idx = imageItems.findIndex(
            (img) =>
              (img.id || img._id) === (selectedImage?.id || selectedImage?._id),
          );
          if (idx >= 0 && idx < imageItems.length - 1)
            setSelectedImage(imageItems[idx + 1]);
        }}
      />

      {/* Link Preview Modal */}
      <LinkPreview
        isOpen={!!selectedLink}
        onClose={() => setSelectedLink(null)}
        link={selectedLink}
        onDelete={(id) => handleDeletePost(id, "link")}
        hasPrev={
          linkItems.findIndex(
            (l) => (l.id || l._id) === (selectedLink?.id || selectedLink?._id),
          ) > 0
        }
        hasNext={
          linkItems.findIndex(
            (l) => (l.id || l._id) === (selectedLink?.id || selectedLink?._id),
          ) <
          linkItems.length - 1
        }
        onPrev={() => {
          const idx = linkItems.findIndex(
            (l) => (l.id || l._id) === (selectedLink?.id || selectedLink?._id),
          );
          if (idx > 0) setSelectedLink(linkItems[idx - 1]);
        }}
        onNext={() => {
          const idx = linkItems.findIndex(
            (l) => (l.id || l._id) === (selectedLink?.id || selectedLink?._id),
          );
          if (idx >= 0 && idx < linkItems.length - 1)
            setSelectedLink(linkItems[idx + 1]);
        }}
      />
    </Container>
  );
}
