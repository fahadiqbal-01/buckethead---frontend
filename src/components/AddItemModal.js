"use client";
import { authFetch } from "@/utils/authFetch";
import { easeOut, motion } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";
import { FiX, FiCheck } from "react-icons/fi";

export const COLOR_PALETTE = [
  { id: "white", hex: "#fffff3", border: true },
  { id: "blue", hex: "#bfdbfe" },
  { id: "yellow", hex: "#fff085" },
  { id: "pink", hex: "#fccfe9" },
  { id: "orange", hex: "#ffd7a7" },
  { id: "red", hex: "#ffa3a2" },
  { id: "mud", hex: "#1d1919" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/* -------------------------------------------------------------------------- */
/*                           REUSABLE UI PRIMITIVES                           */
/* -------------------------------------------------------------------------- */

const FormInput = ({ className = "", error, ...props }) => (
  <div className="w-full flex flex-col">
    <input
      {...props}
      className={`w-full bg-mud text-white rounded-2xl px-4 py-3 text-[14px] font-jetreg placeholder:text-white/60 outline-none transition-all duration-200 ${
        error
          ? "border border-red-400 ring-2 ring-red-400/40"
          : "focus:ring-2 focus:ring-inset focus:ring-pink"
      } ${className}`}
    />
    {error && (
      <span className="text-[11px] text-red-500 font-jetreg mt-1 px-1 tracking-tight">
        {error}
      </span>
    )}
  </div>
);

const FormTextarea = ({ className = "", error, ...props }) => (
  <div className="w-full flex flex-col">
    <textarea
      {...props}
      className={`w-full bg-mud text-white rounded-2xl p-4 text-[14px] font-jetreg placeholder:text-white/60 outline-none resize-none no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-all duration-200 ${
        error
          ? "border border-red-400 ring-2 ring-red-400/40"
          : "focus:ring-2 focus:ring-inset focus:ring-pink"
      } ${className}`}
    />
    {error && (
      <span className="text-[11px] text-red-500 font-jetreg mt-1 px-1 tracking-tight">
        {error}
      </span>
    )}
  </div>
);

const SubmitButton = ({
  children = "Save",
  loading = false,
  disabled = false,
}) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className={`w-full font-jetreg text-[15px] font-medium py-3.5 rounded-full duration-300 ease-out shadow-md flex items-center justify-center gap-2 select-none ${
      loading || disabled
        ? "bg-mud/70 text-white/80 cursor-not-allowed"
        : "bg-mud text-white hover:bg-pink hover:text-mud cursor-pointer"
    }`}
  >
    {loading ? (
      <>
        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        <span>Saving...</span>
      </>
    ) : (
      children
    )}
  </button>
);

const FileUploadDropzone = ({
  preview,
  onChange,
  icon = "/icons/image.svg",
  alt = "Upload",
  height = "h-44",
  error,
}) => (
  <div className="w-full flex flex-col">
    <label
      className={`relative bg-mud rounded-2xl ${height} flex flex-col items-center justify-center cursor-pointer group overflow-hidden border-2 border-dashed transition-all duration-300 ease-out ${
        error
          ? "border-red-400 ring-2 ring-red-400/30"
          : "border-transparent hover:border-gray-300"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-full object-cover rounded-2xl"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-mud group-hover:text-gray-600">
          <img src={icon} className="w-8 h-8" alt={alt} />
        </div>
      )}
    </label>
    {error && (
      <span className="text-[11px] text-red-500 font-jetreg mt-1 px-1 tracking-tight">
        {error}
      </span>
    )}
  </div>
);

// color picker
const ColorPicker = ({
  colors = COLOR_PALETTE,
  selectedColor,
  onSelectColor,
}) => (
  <div className="grid grid-cols-7 gap-1.5 justify-items-center items-center py-1">
    {colors.map((col) => {
      const isSelected = selectedColor === col.id;
      return (
        <button
          key={col.id}
          type="button"
          onClick={() => onSelectColor(col.id)}
          className="relative w-6 h-6 rounded-full cursor-pointer flex items-center justify-center hover:ring-2 hover:ring-mud hover:ring-offset-1 transition-transform hover:scale-105"
          style={{
            backgroundColor: col.hex,
            border: col.border ? "1.5px solid #d1d5db" : "none",
          }}
          aria-label={`Select color ${col.id}`}
        >
          {isSelected && (
            <FiCheck
              strokeWidth={3}
              className={`text-sm ${
                col.id === "white"
                  ? "text-gray-900"
                  : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
              }`}
            />
          )}
        </button>
      );
    })}
  </div>
);

// all tabs
const ImageTabForm = ({ onSubmit }) => {
  const [imgFile, setImgFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileNote, setFileNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setImgFile(selectedFile);
      setFileName(selectedFile.name);
      setErrors((prev) => ({ ...prev, file: null, fileName: null }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  async function uploadToCloudinary(file) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration missing");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }

    return data.secure_url;
  }

  async function PhotoPost(file, name, note) {
    const imageUrl = await uploadToCloudinary(file);

    const response = await authFetch(`${API_URL}/photoupload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        photo_url: imageUrl,
        name,
        note,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(
        data.detail ||
          data.details ||
          data.error ||
          `Upload failed (${response.status})`,
      );
    }

    return data;
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!imgFile) {
      newErrors.file = "Image is required";
    }
    if (!fileName.trim()) {
      newErrors.fileName = "Title is required";
    } else if (fileName.length > 20) {
      newErrors.fileName = "Title cannot exceed 20 characters";
    }

    if (!fileNote.trim()) {
      newErrors.fileNote = "Description is required";
    } else if (fileNote.length > 50) {
      newErrors.fileNote = "Description cannot exceed 50 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // 1-second delay to show saving state smoothly
      await new Promise((res) => setTimeout(res, 1000));

      const uploadResult = await PhotoPost(imgFile, fileName, fileNote);
      onSubmit({
        type: "image",
        post_type: "image",
        file: imgFile,
        fileName,
        name: fileName,
        image_name: fileName,
        note: fileNote,
        image_note: fileNote,
        photo_url: uploadResult?.photo_url || preview,
        image_url:
          uploadResult?.image_url || uploadResult?.photo_url || preview,
        preview,
        ...(typeof uploadResult === "object" ? uploadResult : {}),
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      setErrors({ general: error.message || "Failed to upload image" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex-1 flex flex-col justify-between h-full"
    >
      <div className="flex flex-col gap-3">
        <FileUploadDropzone
          preview={preview}
          onChange={(e) => {
            handleFileChange(e);
            if (errors.file) setErrors((prev) => ({ ...prev, file: null }));
          }}
          icon="/icons/image.svg"
          alt="Image"
          height="h-44"
          error={errors.file}
        />
        <div className="flex flex-col gap-2.5">
          <FormInput
            type="text"
            placeholder="Title *"
            maxLength={20}
            value={fileName}
            error={errors.fileName}
            onChange={(e) => {
              setFileName(e.target.value);
              if (errors.fileName)
                setErrors((prev) => ({ ...prev, fileName: null }));
            }}
          />
          <FormInput
            type="text"
            placeholder="Description *"
            maxLength={50}
            value={fileNote}
            error={errors.fileNote}
            onChange={(e) => {
              setFileNote(e.target.value);
              if (errors.fileNote)
                setErrors((prev) => ({ ...prev, fileNote: null }));
            }}
          />
          {errors.general && (
            <p className="text-[12px] text-red-500 font-jetreg text-center">
              {errors.general}
            </p>
          )}
        </div>
      </div>
      <SubmitButton loading={loading}>Save</SubmitButton>
    </form>
  );
};

const LinkTabForm = ({ onSubmit }) => {
  const [LinkFile, setLinkFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setLinkFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  async function uploadToCloudinary(file) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration missing");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }

    return data.secure_url;
  }

  async function LinkPost(file, linkTitle, linkUrl, linkDesc) {
    let formattedUrl = linkUrl.trim();
    if (
      !formattedUrl.startsWith("http://") &&
      !formattedUrl.startsWith("https://")
    ) {
      formattedUrl = `https://${formattedUrl}`;
    }

    let imageUrl = "";
    if (file) {
      imageUrl = await uploadToCloudinary(file);
    }

    const response = await authFetch(`${API_URL}/linkupload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        link_name: linkTitle,
        link_url: formattedUrl,
        image_url: imageUrl || "",
        link_desc: linkDesc || "",
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(
        data.detail ||
          data.details ||
          data.error ||
          `Upload failed (${response.status})`,
      );
    }

    return data;
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!LinkFile) {
      newErrors.file = "Image is required";
    }

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 20) {
      newErrors.title = "Title cannot exceed 20 characters";
    }

    if (!url.trim()) {
      newErrors.url = "URL is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.length > 50) {
      newErrors.description = "Description cannot exceed 50 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // 1-second delay for smooth saving status
      await new Promise((res) => setTimeout(res, 1000));

      const uploadResult = await LinkPost(LinkFile, title, url, description);
      let formattedUrl = url.trim();
      if (
        !formattedUrl.startsWith("http://") &&
        !formattedUrl.startsWith("https://")
      ) {
        formattedUrl = `https://${formattedUrl}`;
      }

      onSubmit({
        type: "link",
        post_type: "link",
        id: uploadResult?.id,
        link_name: title,
        link_url: formattedUrl,
        link_desc: description,
        image_url: uploadResult?.image_url || preview || "",
        src: uploadResult?.image_url || preview || "",
        text: title,
        href: formattedUrl,
        preview,
      });
    } catch (error) {
      console.error("Link upload failed:", error);
      setErrors({ general: error.message || "Failed to save link" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex-1 flex flex-col justify-between h-full"
    >
      <div className="flex flex-col gap-2.5">
        <FileUploadDropzone
          preview={preview}
          onChange={(e) => {
            handleFileChange(e);
            if (errors.file) setErrors((prev) => ({ ...prev, file: null }));
          }}
          icon="/icons/image.svg"
          alt="Image"
          height="h-44"
          error={errors.file}
        />
        <div className="flex flex-col gap-2">
          <FormInput
            type="text"
            placeholder="Title *"
            maxLength={20}
            value={title}
            error={errors.title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
            className="py-2.5"
          />
          <FormInput
            type="text"
            placeholder="URL *"
            value={url}
            error={errors.url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (errors.url) setErrors((prev) => ({ ...prev, url: null }));
            }}
            className="py-2.5"
          />
          <FormInput
            type="text"
            placeholder="Description *"
            maxLength={50}
            value={description}
            error={errors.description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description)
                setErrors((prev) => ({ ...prev, description: null }));
            }}
            className="py-2.5"
          />
          {errors.general && (
            <p className="text-[12px] text-red-500 font-jetreg text-center">
              {errors.general}
            </p>
          )}
        </div>
      </div>
      <SubmitButton loading={loading}>Save</SubmitButton>
    </form>
  );
};

const NoteTabForm = ({ onSubmit }) => {
  const [color, setColor] = useState(COLOR_PALETTE[0].id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  async function NotePost(noteColor, noteTitle, noteContent) {
    const response = await authFetch(`${API_URL}/noteupload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        color: noteColor || "white",
        node_title: noteTitle,
        note_text: noteContent || "",
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(
        data.detail ||
          data.details ||
          data.error ||
          `Upload failed (${response.status})`,
      );
    }

    return data;
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 20) {
      newErrors.title = "Title cannot exceed 20 characters";
    }

    if (!content.trim()) {
      newErrors.content = "Note content is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // 1-second delay for smooth saving status
      await new Promise((res) => setTimeout(res, 1000));

      const uploadResult = await NotePost(color, title, content);
      onSubmit({
        type: "note",
        post_type: "note",
        id: uploadResult?.id,
        color: uploadResult?.color || color,
        title,
        node_title: title,
        text: title,
        content,
        note_text: content,
      });
    } catch (error) {
      console.error("Note upload failed:", error);
      setErrors({ general: error.message || "Failed to save note" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex-1 flex flex-col justify-between h-full"
    >
      <div className="flex flex-col gap-3">
        <ColorPicker selectedColor={color} onSelectColor={setColor} />
        <div className="flex flex-col gap-2.5">
          <FormInput
            type="text"
            placeholder="Title *"
            maxLength={20}
            value={title}
            error={errors.title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
          />
          <FormTextarea
            placeholder="Note *"
            value={content}
            error={errors.content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content)
                setErrors((prev) => ({ ...prev, content: null }));
            }}
            rows={7}
            className="h-45"
          />
          {errors.general && (
            <p className="text-[12px] text-red-500 font-jetreg text-center">
              {errors.general}
            </p>
          )}
        </div>
      </div>
      <SubmitButton loading={loading}>Save</SubmitButton>
    </form>
  );
};

const SpaceTabForm = ({ onSubmit }) => {
  const [name, setName] = useState("New space");
  const [color, setColor] = useState(COLOR_PALETTE[0].id);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  async function SpacePost(folderName, folderColorHex) {
    const response = await authFetch(`${API_URL}/createspace`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folder_name: folderName,
        folder_color: folderColorHex,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(
        data.detail ||
          data.details ||
          data.error ||
          `Failed to create space (${response.status})`,
      );
    }

    return data;
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const cleanName = name.trim();
    if (!cleanName) {
      setErrors({ name: "Space name is required" });
      return;
    }
    if (cleanName.length > 15) {
      setErrors({ name: "Space name cannot exceed 15 characters" });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 600));
      const selectedColorObj = COLOR_PALETTE.find((c) => c.id === color);
      const colorHex = selectedColorObj ? selectedColorObj.hex : "#fffff3";

      const createdData = await SpacePost(cleanName, colorHex);
      onSubmit({
        type: "space",
        folder_name: cleanName,
        folder_color: colorHex,
        post_ids: [],
        ...(typeof createdData === "object" ? createdData : {}),
      });
    } catch (err) {
      console.error("Space creation failed:", err);
      setErrors({ name: err.message || "Failed to create space" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex-1 flex flex-col justify-between h-full"
    >
      <div className="flex flex-col gap-4 py-2">
        <FormInput
          type="text"
          placeholder="Space name *"
          maxLength={15}
          value={name}
          error={errors.name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({});
          }}
        />
        <ColorPicker selectedColor={color} onSelectColor={setColor} />
      </div>
      <SubmitButton loading={loading}>Create Space</SubmitButton>
    </form>
  );
};

const TABS = [
  { id: 0, label: "Image", icon: "/icons/image.svg", Component: ImageTabForm },
  { id: 1, label: "Link", icon: "/icons/link.svg", Component: LinkTabForm },
  { id: 2, label: "Note", icon: "/icons/note.svg", Component: NoteTabForm },
  { id: 3, label: "Space", icon: "/icons/space.svg", Component: SpaceTabForm },
];

// main
export default function AddItemModal({
  isOpen,
  onClose,
  onAddItem,
  initialTab = 0,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleClose = useCallback(() => {
    setActiveTab(0);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const ActiveTabComponent = TABS[activeTab]?.Component || ImageTabForm;

  const handleTabSubmit = (itemData) => {
    onAddItem?.(itemData);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("item-added", { detail: itemData }));
      if (itemData?.type === "space") {
        window.dispatchEvent(
          new CustomEvent("space-created", { detail: itemData }),
        );
      }
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 isolate">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-mud/50 transition-opacity duration-200"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: easeOut }}
        className="relative z-10 w-full max-w-92.5 h-130 bg-white rounded-[36px] p-5 shadow-2xl border border-black/5 overflow-hidden select-none flex flex-col justify-between transform-gpu"
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="w-10 h-10 rounded-full bg-mud text-white hover:bg-pink hover:text-mud duration-300 ease-in-out flex items-center justify-center cursor-pointer shadow-sm"
          >
            <FiX className="text-xl" />
          </button>

          <div className="bg-mud/20 p-1 rounded-full flex items-center gap-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-label={tab.label}
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 ${
                    isActive
                      ? "text-mud font-bold"
                      : "text-mud hover:opacity-80"
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-mud rounded-full shadow-sm" />
                  )}
                  <div
                    className="relative z-10 w-4.5 h-4.5"
                    style={{
                      backgroundColor: isActive ? "white" : "#1d1919",
                      maskImage: `url(${tab.icon})`,
                      WebkitMaskImage: `url(${tab.icon})`,
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Body */}
        <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
          <ActiveTabComponent onSubmit={handleTabSubmit} />
        </div>
      </motion.div>
    </div>
  );
}
