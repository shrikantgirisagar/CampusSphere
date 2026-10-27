/* ============================================================================
   CampusSphere Pure Utility Module
   Pure, side-effect-free helpers for sanitization, security, formatting, and validation.
   Loaded before application scripts.
   ============================================================================ */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    const utils = factory();
    root.CampusSphereUtils = utils;
    // Export aliases to global scope if in browser
    if (typeof window !== "undefined") {
      window.escapeHtml = window.escapeHtml || utils.escapeHtml;
      window.escapeAttr = window.escapeAttr || utils.escapeAttr;
      window.stripHtmlTags = window.stripHtmlTags || utils.stripHtmlTags;
      window.sanitizeDownloadUrl = window.sanitizeDownloadUrl || utils.sanitizeDownloadUrl;
      window.sanitizeImageUrl = window.sanitizeImageUrl || utils.sanitizeImageUrl;
      window.validatePasswordStrength = window.validatePasswordStrength || utils.validatePasswordStrength;
      window.isValidEmailAddress = window.isValidEmailAddress || utils.isValidEmailAddress;
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function stripHtmlTags(str) {
    if (!str || typeof str !== "string") return "";
    return str.replace(/<[^>]*>/g, "").trim();
  }

  function sanitizeDownloadUrl(url) {
    if (!url) return "#";
    const str = String(url).trim().replace(/[\x00-\x1F\x7F]/g, "");
    const lower = str.toLowerCase();
    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("vbscript:") ||
      lower.startsWith("data:text/html") ||
      lower.startsWith("data:text/xhtml") ||
      lower.startsWith("data:text/xml") ||
      lower.startsWith("data:image/svg+xml")
    ) {
      return "#";
    }
    if (
      lower.startsWith("http://") ||
      lower.startsWith("https://") ||
      lower.startsWith("blob:") ||
      lower.startsWith("/") ||
      lower.startsWith("./")
    ) {
      return str;
    }
    if (
      lower.startsWith("data:image/png") ||
      lower.startsWith("data:image/jpeg") ||
      lower.startsWith("data:image/jpg") ||
      lower.startsWith("data:image/webp") ||
      lower.startsWith("data:image/gif") ||
      lower.startsWith("data:image/bmp") ||
      lower.startsWith("data:application/pdf") ||
      lower.startsWith("data:application/zip") ||
      lower.startsWith("data:application/msword") ||
      lower.startsWith("data:application/vnd.") ||
      lower.startsWith("data:application/octet-stream") ||
      lower.startsWith("data:text/plain") ||
      lower.startsWith("data:text/csv")
    ) {
      return str;
    }
    return "#";
  }

  function sanitizeImageUrl(url) {
    if (!url) return "";
    const str = String(url).trim().replace(/[\x00-\x1F\x7F]/g, "");
    const lower = str.toLowerCase();
    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("vbscript:") ||
      lower.startsWith("data:text/html") ||
      lower.startsWith("data:text/xhtml") ||
      lower.startsWith("data:text/xml")
    ) {
      return "";
    }
    if (
      lower.startsWith("http://") ||
      lower.startsWith("https://") ||
      lower.startsWith("blob:") ||
      lower.startsWith("/") ||
      lower.startsWith("./")
    ) {
      return str;
    }
    if (
      lower.startsWith("data:image/png") ||
      lower.startsWith("data:image/jpeg") ||
      lower.startsWith("data:image/jpg") ||
      lower.startsWith("data:image/webp") ||
      lower.startsWith("data:image/gif") ||
      lower.startsWith("data:image/bmp")
    ) {
      return str;
    }
    if (lower.startsWith("data:image/svg+xml")) {
      if (/<\s*script/i.test(str) || /\bon\w+\s*=/i.test(str) || /javascript:/i.test(str)) {
        return "";
      }
      return str;
    }
    return "";
  }

  function validatePasswordStrength(password) {
    if (!password || typeof password !== "string") {
      return "Password is required.";
    }
    if (password.length < 10) {
      return "Password must contain at least 10 characters.";
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return "Password must contain at least one letter and one number.";
    }
    return null;
  }

  function validateUsername(username) {
    if (!username || typeof username !== "string") {
      return "Username is required.";
    }
    const clean = username.trim();
    if (!/^[A-Za-z0-9_.-]{4,30}$/.test(clean)) {
      return "Username must be 4–30 letters, numbers, dot, dash or underscore.";
    }
    return null;
  }

  function isValidEmailAddress(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
  }

  function getCourseYearForSemester(sem) {
    if (sem === "1st Semester" || sem === "2nd Semester") return "1st Year";
    if (sem === "3rd Semester" || sem === "4th Semester") return "2nd Year";
    if (sem === "5th Semester" || sem === "6th Semester") return "3rd Year";
    return "1st Year";
  }

  return {
    escapeHtml,
    escapeAttr,
    stripHtmlTags,
    sanitizeDownloadUrl,
    sanitizeImageUrl,
    validatePasswordStrength,
    validateUsername,
    isValidEmailAddress,
    getCourseYearForSemester
  };
});
