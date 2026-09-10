/**
 * Client-side image compression utility.
 * Resizes large camera/high-res images to a max bounding box (1600px)
 * and compresses to WebP/JPEG to drastically speed up network uploads.
 */
export async function compressImage(
  file,
  { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = {},
) {
  if (!file || !(file instanceof Blob) || !file.type.startsWith("image/")) {
    return file;
  }

  // SVG, GIF, or already very small images (< 150KB) don't need compression
  if (
    file.type === "image/svg+xml" ||
    file.type === "image/gif" ||
    file.size < 150 * 1024
  ) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // If dimensions are within bounds and file size < 350KB, keep original
      if (width <= maxWidth && height <= maxHeight && file.size < 350 * 1024) {
        return resolve(file);
      }

      // Calculate new scaled dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { alpha: false });

      if (!ctx) {
        return resolve(file);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP if supported, fallback to JPEG
      const outputType = "image/jpeg";

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // If compression didn't reduce size, use original
            return resolve(file);
          }

          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, ".jpg"),
            {
              type: outputType,
              lastModified: Date.now(),
            },
          );

          resolve(compressedFile);
        },
        outputType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

