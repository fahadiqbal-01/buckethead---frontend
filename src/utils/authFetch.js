const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

function getCookie(cname) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + cname + "=([^;]+)"));
  return match ? match[2] : null;
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token") || getCookie("access_token");
}

let refreshPromise = null;

export async function silentRefreshToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const token = getAuthToken();
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data?.access_token || data?.token;
        if (newToken && typeof window !== "undefined") {
          localStorage.setItem("access_token", newToken);
          try {
            document.cookie = `access_token=${newToken}; path=/; max-age=86400; SameSite=Lax`;
          } catch (e) {}
        }
        return newToken || true;
      }
      return null;
    } catch (err) {
      console.error("[authFetch] Failed to refresh token:", err);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function authFetch(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    credentials: options.credentials || "include",
    headers,
  };

  let response = await fetch(url, fetchOptions);

  // If 401 Unauthorized or Token expired, attempt silent token refresh and retry
  if (response.status === 401) {
    console.warn(
      "[authFetch] Request returned 401. Attempting auto-refresh...",
    );
    const newToken = await silentRefreshToken();

    if (newToken) {
      const activeToken =
        typeof newToken === "string" ? newToken : getAuthToken();
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${activeToken}`,
      };
      response = await fetch(url, {
        ...fetchOptions,
        headers: retryHeaders,
      });
    }
  }

  return response;
}
