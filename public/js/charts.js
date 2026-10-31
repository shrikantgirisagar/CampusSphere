/* ============================================================================
   CampusSphere Analytics & Chart Rendering Module (public/js/charts.js)
   Vendor Chart.js integration for attendance progress and academic marks analytics.
   ============================================================================ */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    const charts = factory();
    root.CampusSphereCharts = charts;
    if (typeof window !== "undefined") {
      window.renderAttendanceChart = window.renderAttendanceChart || charts.renderAttendanceChart;
      window.renderMarksChart = window.renderMarksChart || charts.renderMarksChart;
      window.destroyChartInstance = window.destroyChartInstance || charts.destroyChartInstance;
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const chartInstances = new Map();

  function destroyChartInstance(canvasId) {
    if (chartInstances.has(canvasId)) {
      try {
        const inst = chartInstances.get(canvasId);
        if (inst && typeof inst.destroy === "function") {
          inst.destroy();
        }
      } catch (_) {}
      chartInstances.delete(canvasId);
    }
  }

  function renderAttendanceChart(canvasId, subjectData) {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js vendor library is not loaded.");
      return null;
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    destroyChartInstance(canvasId);

    const labels = (subjectData || []).map(s => s.short || s.name || "Subject");
    const values = (subjectData || []).map(s => Number(s.pct || s.attPct || 0));
    const colors = values.map(val => val >= 75 ? "#2F6F55" : (val >= 60 ? "#A8671A" : "#A93A2B"));

    try {
      const chart = new Chart(canvas, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Attendance Percentage (%)",
            data: values,
            backgroundColor: colors,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: { callback: v => `${v}%` }
            }
          }
        }
      });

      chartInstances.set(canvasId, chart);
      return chart;
    } catch (err) {
      console.warn("Failed to render attendance chart:", err);
      return null;
    }
  }

  function renderMarksChart(canvasId, marksData) {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js vendor library is not loaded.");
      return null;
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    destroyChartInstance(canvasId);

    const labels = (marksData || []).map(m => m.short || m.name || "Subject");
    const values = (marksData || []).map(m => Number(m.tot || m.total || 0));

    try {
      const chart = new Chart(canvas, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Total Marks",
            data: values,
            backgroundColor: "#1459d9",
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 50
            }
          }
        }
      });

      chartInstances.set(canvasId, chart);
      return chart;
    } catch (err) {
      console.warn("Failed to render marks chart:", err);
      return null;
    }
  }

  return {
    destroyChartInstance,
    renderAttendanceChart,
    renderMarksChart
  };
});
