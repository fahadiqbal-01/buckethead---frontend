const colorCache = new Map();

export function getCachedColors(src) {
  if (!src) return null;
  return colorCache.get(src) || null;
}

const NEUTRAL_FALLBACK = {
  bgColor: "#f4f4f0",
  dominant: "#1d1919",
  palette: ["#201213", "#73181f", "#b04043", "#e3a9a8", "#f1cdcb"],
};

/**
 * Extracts dominant colors, palette swatches, and a pastel background tint
 * from an image URL using an in-memory Canvas.
 */
export async function extractImageColors(src) {
  if (!src || typeof window === "undefined") {
    return NEUTRAL_FALLBACK;
  }

  if (colorCache.has(src)) {
    return colorCache.get(src);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          throw new Error("Canvas context not available");
        }

        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size).data;
        const colorCounts = {};
        let rTotal = 0,
          gTotal = 0,
          bTotal = 0,
          count = 0;

        // Sample pixels
        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          if (a < 128) continue; // skip transparent pixels

          rTotal += r;
          gTotal += g;
          bTotal += b;
          count++;

          // Quantize colors to find clusters
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          const key = `${qr},${qg},${qb}`;
          colorCounts[key] = (colorCounts[key] || 0) + 1;
        }

        const avgR = count ? Math.round(rTotal / count) : 220;
        const avgG = count ? Math.round(gTotal / count) : 220;
        const avgB = count ? Math.round(bTotal / count) : 220;

        const rgbToHex = (r, g, b) =>
          "#" +
          [r, g, b]
            .map((x) =>
              Math.min(255, Math.max(0, x)).toString(16).padStart(2, "0"),
            )
            .join("");

        // Sort quantized colors by popularity
        const sorted = Object.keys(colorCounts).sort(
          (a, b) => colorCounts[b] - colorCounts[a],
        );

        // Build 5 distinct palette swatches
        const palette = sorted.slice(0, 5).map((key) => {
          const [r, g, b] = key.split(",").map(Number);
          return rgbToHex(r, g, b);
        });

        while (palette.length < 5) {
          palette.push(rgbToHex(avgR, avgG, avgB));
        }

        // Generate a soft pastel background tint (88% white + 12% dominant color)
        const bgR = Math.round(avgR * 0.12 + 255 * 0.88);
        const bgG = Math.round(avgG * 0.12 + 255 * 0.88);
        const bgB = Math.round(avgB * 0.12 + 255 * 0.88);
        const bgColor = rgbToHex(bgR, bgG, bgB);

        const result = {
          bgColor,
          dominant: rgbToHex(avgR, avgG, avgB),
          palette,
        };
        colorCache.set(src, result);
        resolve(result);
      } catch {
        resolve(NEUTRAL_FALLBACK);
      }
    };

    img.onerror = () => {
      resolve(NEUTRAL_FALLBACK);
    };
  });
}
