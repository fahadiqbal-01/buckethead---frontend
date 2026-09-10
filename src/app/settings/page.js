"use client";
import Container from "@/components/container";
import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  Upload,
  Trash2,
  LogOut,
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Slide, ToastContainer, toast } from "react-toastify";
import { authFetch } from "@/utils/authFetch";
import { useSilentRefresh } from "@/hooks/useSilentRefresh";

export default function Settings() {
  useSilentRefresh();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("/icons/cat.gif");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [username, setUsername] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [savingUsername, setSavingUsername] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

  const uploadToCloudinary = async (file) => {
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dnm3tmkca";
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "Buckethead";

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
  };

  useEffect(() => {
    let isMounted = true;
    async function loadUserData() {
      setLoadingUser(true);
      try {
        const res = await authFetch(`${API_URL}/getuser`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.name || data.username) {
              const fetchedName = data.name || data.username;
              setUsername(fetchedName);
              if (typeof window !== "undefined") {
                localStorage.setItem("username", fetchedName);
              }
            }
            if (data.image_url) {
              setImagePreview(data.image_url);
              if (typeof window !== "undefined") {
                localStorage.setItem("user_avatar", data.image_url);
              }
            }
          }
        } else {
          if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("username");
            if (storedUser && isMounted) setUsername(storedUser);
            const storedAvatar = localStorage.getItem("user_avatar");
            if (storedAvatar && isMounted) setImagePreview(storedAvatar);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        if (typeof window !== "undefined") {
          const storedUser = localStorage.getItem("username");
          if (storedUser && isMounted) setUsername(storedUser);
          const storedAvatar = localStorage.getItem("user_avatar");
          if (storedAvatar && isMounted) setImagePreview(storedAvatar);
        }
      } finally {
        if (isMounted) setLoadingUser(false);
      }
    }

    loadUserData();
    return () => {
      isMounted = false;
    };
  }, [API_URL]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    // Instant local preview
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    setUploadingImage(true);

    try {
      // 1. Upload directly to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);

      // 2. Save image_url into database
      const res = await authFetch(`${API_URL}/update-profile-image`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url: cloudinaryUrl }),
      });

      if (!res.ok) {
        throw new Error("Failed to save image URL to database");
      }

      setImagePreview(cloudinaryUrl);
      if (typeof window !== "undefined") {
        localStorage.setItem("user_avatar", cloudinaryUrl);
        window.dispatchEvent(new Event("avatarUpdated"));
      }

      toast.success("Profile photo uploaded and saved!", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        theme: "dark",
        transition: Slide,
      });
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error(err.message || "Failed to upload image", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        theme: "dark",
        transition: Slide,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_avatar");
      window.dispatchEvent(new Event("avatarUpdated"));
    }

    try {
      await authFetch(`${API_URL}/update-profile-image`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url: "" }),
      });
    } catch (err) {
      console.error("Error removing profile image:", err);
    }

    toast.info("Profile photo removed", {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: true,
      theme: "dark",
      transition: Slide,
    });
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      toast.error("Username cannot be empty", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        theme: "dark",
        transition: Slide,
      });
      return;
    }

    setSavingUsername(true);
    try {
      const res = await authFetch(`${API_URL}/update-username`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: cleanUsername }),
      });

      if (res.ok) {
        if (typeof window !== "undefined") {
          localStorage.setItem("username", cleanUsername);
        }
        setSaved(true);
        toast.success("Username saved successfully!", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: true,
          theme: "dark",
          transition: Slide,
        });
        setTimeout(() => setSaved(false), 2000);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.detail || "Failed to update username", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          theme: "dark",
          transition: Slide,
        });
      }
    } catch (err) {
      console.error("Error updating username:", err);
      toast.error("Network error while saving username", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        theme: "dark",
        transition: Slide,
      });
    } finally {
      setSavingUsername(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("buckethead_posts_cache");
      localStorage.removeItem("user_avatar");
      localStorage.removeItem("username");
      document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      document.cookie =
        "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }

    toast.info("Logging out...", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: true,
      theme: "dark",
      transition: Slide,
    });

    setTimeout(() => {
      window.location.href = "/welcome";
    }, 600);
  };

  return (
    <section className="min-h-screen select-none bg-white">
      <Container className="py-6">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-mud/70 hover:text-mud font-jetreg text-sm mb-6 cursor-pointer duration-200 ease-out"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* credit */}
        <div className="flex justify-start items-center gap-2 mb-2 w-fit mx-auto">
          <h2 className="text-xl font-jetbold tracking-tighter">Made by</h2>
          <img
            src="/icons/cat.gif"
            className="w-16 rounded-full"
            alt="Creator"
          />
          <a
            href="https://fahadiqbal.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl text-mud font-striper underline"
          >
            FahadIqbal
          </a>
        </div>

        <div className="pt-8 max-w-xl mx-auto">
          <h2 className="text-2xl text-mud font-jetbold">Settings</h2>

          <div className="mt-6">
            <h3 className="text-lg text-mud font-jetreg mb-3">Account</h3>

            {/* profile pic */}
            <div className="flex items-center gap-5 p-4 rounded-xl bg-white border border-mud/10 shadow-sm w-full">
              <div className="relative group w-20 h-20 rounded-full overflow-hidden bg-mud/10 flex items-center justify-center border-2 border-mud/20 shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Selected avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-mud/50" />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="avatar-file-upload"
                />

                <label
                  htmlFor={uploadingImage ? undefined : "avatar-file-upload"}
                  className={`px-4 py-2 bg-mud text-white hover:bg-orange hover:text-black font-jetreg text-sm rounded-md duration-200 ease-out flex items-center gap-2 w-fit ${
                    uploadingImage
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {uploadingImage ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {uploadingImage ? "Uploading..." : "Select Image"}
                </label>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs text-red-500 hover:text-red-700 font-jetreg flex items-center gap-1 cursor-pointer w-fit"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* username */}
            <form
              onSubmit={handleUsernameSubmit}
              className="mt-6 p-4 rounded-xl bg-white border border-mud/10 shadow-sm w-full flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-mud font-jetreg font-medium">
                  Username
                </label>
                <input
                  type="text"
                  placeholder={
                    loadingUser ? "Loading username..." : "Enter your username"
                  }
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loadingUser || savingUsername}
                  maxLength={30}
                  className="w-full bg-white border border-mud/20 rounded-md py-2.5 px-3 text-sm text-mud font-jetreg outline-none focus:border-orange focus:ring-1 focus:ring-orange transition duration-200 placeholder:font-jetreg placeholder:text-mud/40 disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={loadingUser || savingUsername}
                className="px-5 py-2.5 bg-mud text-white hover:bg-orange hover:text-black font-jetreg text-sm rounded-md cursor-pointer duration-200 ease-out font-medium w-fit flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingUsername ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : saved ? (
                  <Check size={16} />
                ) : null}
                {savingUsername
                  ? "Saving..."
                  : saved
                    ? "Saved"
                    : "Save Username"}
              </button>
            </form>

            {/* log out */}
            <div className="mt-8 pt-6 border-t border-mud/10">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue text-mud hover:bg-red hover:text-white font-jetreg text-sm rounded-md cursor-pointer duration-200 ease-out font-medium"
              >
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </Container>

      <ToastContainer
        position="top-right"
        limit={2}
        autoClose={1500}
        hideProgressBar
        closeButton={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Slide}
      />
    </section>
  );
}
