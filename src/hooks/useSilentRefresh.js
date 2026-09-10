"use client";
import { useEffect, useRef, useCallback } from "react";
import { silentRefreshToken, getAuthToken } from "@/utils/authFetch";

function parseJwtExp(token) {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed.exp ? parsed.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function useSilentRefresh() {
  const timerRef = useRef(null);

  const performRefresh = useCallback(async () => {
    const newToken = await silentRefreshToken();
    if (newToken) {
      const activeToken =
        typeof newToken === "string" ? newToken : getAuthToken();
      schedule(activeToken);
    }
  }, []);

  const schedule = useCallback(
    (token) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const activeToken = token || getAuthToken();
      if (!activeToken) return;

      const expTime = parseJwtExp(activeToken);

      let delay = 55 * 60 * 1000; // Default 55 min fallback

      if (expTime) {
        const timeUntilExpiry = expTime - Date.now();
        // Refresh 1 minute (60,000 ms) before expiration
        delay = timeUntilExpiry - 60 * 1000;

        // If already within 1 min of expiry or expired, refresh after 100ms
        if (delay <= 0) {
          delay = 100;
        }
      }

      timerRef.current = setTimeout(() => {
        performRefresh();
      }, delay);
    },
    [performRefresh],
  );

  useEffect(() => {
    // Schedule based on current token exp
    schedule();

    // On tab visibility change or focus
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        const token = getAuthToken();
        const expTime = parseJwtExp(token);
        if (expTime && expTime - Date.now() <= 2 * 60 * 1000) {
          performRefresh();
        }
      }
    };

    document.addEventListener("visibilitychange", handleFocus);
    window.addEventListener("focus", handleFocus);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("focus", handleFocus);
    };
  }, [schedule, performRefresh]);

  return { performRefresh };
}
