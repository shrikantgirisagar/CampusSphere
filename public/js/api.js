/* ============================================================================
   CampusSphere API Client Module (public/js/api.js)
   Authenticated fetch wrapper, session token management, sliding refresh, and error handling.
   ============================================================================ */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    const api = factory();
    root.CampusSphereApi = api;
    if (typeof window !== "undefined") {
      window.getStoredAuthToken = window.getStoredAuthToken || api.getStoredAuthToken;
      window.setStoredAuthToken = window.setStoredAuthToken || api.setStoredAuthToken;
      window.getAuthHeaders = window.getAuthHeaders || api.getAuthHeaders;
      window.authenticatedFetch = window.authenticatedFetch || api.authenticatedFetch;
      window.apiRequest = window.apiRequest || api.apiRequest;
      window.getStatusErrorMessage = window.getStatusErrorMessage || api.getStatusErrorMessage;
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const API_BASE_URL = typeof window !== "undefined" && window.API_BASE_URL ? window.API_BASE_URL : "";

  function getStoredAuthToken() {
    try {
      return sessionStorage.getItem("portalAuthToken") || "";
    } catch (_) {
      return "";
    }
  }

  function setStoredAuthToken(token) {
    try {
      if (token) {
        sessionStorage.setItem("portalAuthToken", token);
      } else {
        sessionStorage.removeItem("portalAuthToken");
      }
    } catch (_) {}
  }

  function getAuthHeaders(extraHeaders = {}) {
    const headers = { ...extraHeaders };
    const token = getStoredAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  function getStatusErrorMessage(status) {
    switch (status) {
      case 400:
        return "Invalid request. Please check the entered data.";
      case 401:
        return "Authentication required. Please log in.";
      case 403:
        return "Access denied. You do not have permission for this action.";
      case 404:
        return "The requested record or resource was not found.";
      case 409:
        return "A conflict occurred with existing data. Please check and try again.";
      case 413:
        return "Payload too large. Please select a smaller file or reduce the data size.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Internal server error. Please try again later.";
      case 503:
        return "Service temporarily unavailable. Please check server status.";
      default:
        return "An unexpected server error occurred.";
    }
  }

  async function authenticatedFetch(url, options = {}) {
    const optionsCopy = { ...options };
    optionsCopy.headers = getAuthHeaders(optionsCopy.headers || {});

    let response;
    try {
      response = await fetch(url, optionsCopy);
    } catch (netErr) {
      throw new Error("Unable to connect to the server. Please check your connection and try again.");
    }

    if (response && response.headers) {
      const refreshed = response.headers.get("x-refreshed-token");
      if (refreshed) {
        setStoredAuthToken(refreshed);
      }
    }

    if (response.status === 401) {
      if (getStoredAuthToken() || (typeof window !== "undefined" && window.currentUser)) {
        if (typeof window.handleSessionExpired === "function") {
          window.handleSessionExpired("Your session has expired. Please log in again.");
        }
      }
    }

    return response;
  }

  async function apiRequest(endpoint, options = {}) {
    const base = typeof window !== "undefined" && window.API_BASE_URL ? window.API_BASE_URL : API_BASE_URL;
    const url = endpoint.startsWith("http") ? endpoint : `${base}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    let response;
    try {
      response = await authenticatedFetch(url, options);
    } catch (netErr) {
      return {
        success: false,
        status: 0,
        networkError: true,
        message: netErr.message || "Unable to connect to the server. Please check your connection and try again."
      };
    }

    let data = null;
    try {
      data = await response.json();
    } catch (_) {
      data = null;
    }

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: (data && data.message) || getStatusErrorMessage(response.status),
        data: data || null
      };
    }

    return data !== null ? data : { success: true, status: response.status };
  }

  return {
    getStoredAuthToken,
    setStoredAuthToken,
    getAuthHeaders,
    getStatusErrorMessage,
    authenticatedFetch,
    apiRequest
  };
});
