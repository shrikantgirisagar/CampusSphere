/* ============================================================================
   CampusSphere Role Dashboard Views Module (public/js/dashboard.js)
   Helpers and layouts for student, faculty, and administrator dashboard views.
   ============================================================================ */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    const dashboard = factory();
    root.CampusSphereDashboard = dashboard;
    if (typeof window !== "undefined") {
      window.getDashboardRoleLabel = window.getDashboardRoleLabel || dashboard.getDashboardRoleLabel;
      window.renderUserRolePill = window.renderUserRolePill || dashboard.renderUserRolePill;
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function getDashboardRoleLabel(role) {
    switch (String(role || "").toLowerCase()) {
      case "admin":
        return "System Administrator";
      case "faculty":
        return "Faculty Professor";
      case "student":
        return "Student Scholar";
      default:
        return "Portal Guest";
    }
  }

  function renderUserRolePill(user) {
    if (!user) return "";
    const escapeHtml = typeof window !== "undefined" && window.escapeHtml ? window.escapeHtml : s => String(s || "");
    const role = String(user.role || "student").toLowerCase();
    const colors = {
      admin: { bg: "#fef3c7", text: "#92400e", label: "Admin" },
      faculty: { bg: "#e0f2fe", text: "#0369a1", label: "Faculty" },
      student: { bg: "#dcfce7", text: "#15803d", label: "Student" }
    };
    const conf = colors[role] || { bg: "#f1f5f9", text: "#475569", label: "User" };

    return `<span class="badge" style="background:${conf.bg}; color:${conf.text}; font-weight:700; padding:3px 8px; border-radius:6px;">${escapeHtml(conf.label)}</span>`;
  }

  return {
    getDashboardRoleLabel,
    renderUserRolePill
  };
});
