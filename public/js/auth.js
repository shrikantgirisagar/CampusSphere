/* ============================================================================
   CampusSphere Authentication & Session Module (public/js/auth.js)
   Login, signup, session persistence, role switching, and logout lifecycle.
   ============================================================================ */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    const auth = factory();
    root.CampusSphereAuth = auth;
    if (typeof window !== "undefined") {
      window.loginUser = window.loginUser || auth.loginUser;
      window.logoutUser = window.logoutUser || auth.logoutUser;
      window.restoreSessionUser = window.restoreSessionUser || auth.restoreSessionUser;
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function getApiBase() {
    return typeof window !== "undefined" && window.API_BASE_URL ? window.API_BASE_URL : "";
  }

  function restoreSessionUser() {
    try {
      const raw = sessionStorage.getItem("portalUser");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  async function loginUser(role, username, password) {
    const url = `${getApiBase()}/api/auth/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, username, password })
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success && data.token && data.user) {
      if (typeof window !== "undefined" && typeof window.setStoredAuthToken === "function") {
        window.setStoredAuthToken(data.token);
      }
      sessionStorage.setItem("portalUser", JSON.stringify(data.user));
      if (typeof window !== "undefined") {
        window.currentUser = data.user;
      }
      return { success: true, user: data.user, token: data.token };
    }

    return {
      success: false,
      status: res.status,
      message: data.message || (res.status === 429 ? "Too many attempts. Please try again later." : "Invalid credentials.")
    };
  }

  async function logoutUser() {
    try {
      const token = typeof window !== "undefined" && typeof window.getStoredAuthToken === "function" ? window.getStoredAuthToken() : "";
      if (token) {
        await fetch(`${getApiBase()}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }).catch(() => {});
      }
    } catch (_) {}

    try {
      sessionStorage.removeItem("portalAuthToken");
      sessionStorage.removeItem("portalUser");
    } catch (_) {}

    if (typeof window !== "undefined") {
      window.currentUser = null;
      if (typeof window.navigate === "function") {
        window.navigate("home");
      }
    }
  }

  return {
    restoreSessionUser,
    loginUser,
    logoutUser
  };
});
