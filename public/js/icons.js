/**
 * CampusSphere Central SVG Icon System
 * Standardized Lucide Outline SVG Icons
 * Conforms to Rules 2, 4, 5, 6, and 7
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var exports = factory();
    root.CampusSphereIcons = exports;
    root.renderIcon = exports.renderIcon;
    root.createIconElement = exports.createIconElement;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ICON_PATHS = {
  "alert-octagon": "<polygon points=\"7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2\"/><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\"/><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\"/>",
  "alert-triangle": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z\"/><line x1=\"12\" x2=\"12\" y1=\"9\" y2=\"13\"/><line x1=\"12\" x2=\"12.01\" y1=\"17\" y2=\"17\"/>",
  "at-sign": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8\"/>",
  "award": "<circle cx=\"12\" cy=\"8\" r=\"7\"/><polyline points=\"8.21 13.89 7 23 12 20 17 23 15.79 13.88\"/>",
  "badge-check": "<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\"/><path d=\"m9 12 2 2 4-4\"/>",
  "ban": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m4.9 4.9 14.2 14.2\"/>",
  "bar-chart-3": "<path d=\"M3 3v18h18\"/><path d=\"M18 17V9\"/><path d=\"M13 17V5\"/><path d=\"M8 17v-3\"/>",
  "bell": "<path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\"/><path d=\"M10.3 21a1.94 1.94 0 0 0 3.4 0\"/>",
  "book": "<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z\"/><path d=\"M6 2v20\"/>",
  "book-open": "<path d=\"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z\"/><path d=\"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z\"/>",
  "bot": "<path d=\"M12 8V4H8\"/><rect width=\"16\" height=\"12\" x=\"4\" y=\"8\" rx=\"2\"/><path d=\"M2 14h2\"/><path d=\"M20 14h2\"/><path d=\"M15 13v2\"/><path d=\"M9 13v2\"/>",
  "building-2": "<path d=\"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z\"/><path d=\"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2\"/><path d=\"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2\"/><path d=\"M10 6h4\"/><path d=\"M10 10h4\"/><path d=\"M10 14h4\"/><path d=\"M10 18h4\"/>",
  "calendar": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\" ry=\"2\"/><line x1=\"16\" x2=\"16\" y1=\"2\" y2=\"6\"/><line x1=\"8\" x2=\"8\" y1=\"2\" y2=\"6\"/><line x1=\"3\" x2=\"21\" y1=\"10\" y2=\"10\"/>",
  "calendar-days": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\" ry=\"2\"/><line x1=\"16\" x2=\"16\" y1=\"2\" y2=\"6\"/><line x1=\"8\" x2=\"8\" y1=\"2\" y2=\"6\"/><line x1=\"3\" x2=\"21\" y1=\"10\" y2=\"10\"/><path d=\"M8 14h.01\"/><path d=\"M12 14h.01\"/><path d=\"M16 14h.01\"/><path d=\"M8 18h.01\"/><path d=\"M12 18h.01\"/><path d=\"M16 18h.01\"/>",
  "camera": "<path d=\"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z\"/><circle cx=\"12\" cy=\"13\" r=\"3\"/>",
  "check-circle-2": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m9 12 2 2 4-4\"/>",
  "circle": "<circle cx=\"12\" cy=\"12\" r=\"10\"/>",
  "clipboard-check": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/><path d=\"m9 14 2 2 4-4\"/>",
  "clipboard-list": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/><path d=\"M12 11h4\"/><path d=\"M12 16h4\"/><path d=\"M8 11h.01\"/><path d=\"M8 16h.01\"/>",
  "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/>",
  "cloud": "<path d=\"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z\"/>",
  "code": "<polyline points=\"16 18 22 12 16 6\"/><polyline points=\"8 6 2 12 8 18\"/>",
  "code-2": "<path d=\"m18 16 4-4-4-4\"/><path d=\"m6 8-4 4 4 4\"/><path d=\"m14.5 4-5 16\"/>",
  "coffee": "<path d=\"M17 8h1a4 4 0 1 1 0 8h-1\"/><path d=\"M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z\"/><line x1=\"6\" x2=\"6\" y1=\"2\" y2=\"4\"/><line x1=\"10\" x2=\"10\" y1=\"2\" y2=\"4\"/><line x1=\"14\" x2=\"14\" y1=\"2\" y2=\"4\"/>",
  "corner-down-left": "<polyline points=\"9 10 4 15 9 20\"/><path d=\"M20 4v7a4 4 0 0 1-4 4H4\"/>",
  "database": "<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\"/><path d=\"M3 5V19A9 3 0 0 0 21 19V5\"/><path d=\"M3 12A9 3 0 0 0 21 12\"/>",
  "download": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"7 10 12 15 17 10\"/><line x1=\"12\" x2=\"12\" y1=\"15\" y2=\"3\"/>",
  "eye": "<path d=\"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
  "eye-off": "<path d=\"M9.88 9.88a3 3 0 1 0 4.24 4.24\"/><path d=\"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68\"/><path d=\"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61\"/><line x1=\"2\" x2=\"22\" y1=\"2\" y2=\"22\"/>",
  "file-check": "<path d=\"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z\"/><polyline points=\"14 2 14 8 20 8\"/><path d=\"m9 15 2 2 4-4\"/>",
  "file-edit": "<path d=\"M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5\"/><polyline points=\"14 2 14 8 20 8\"/><path d=\"M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z\"/>",
  "file-text": "<path d=\"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z\"/><polyline points=\"14 2 14 8 20 8\"/><line x1=\"16\" x2=\"8\" y1=\"13\" y2=\"13\"/><line x1=\"16\" x2=\"8\" y1=\"17\" y2=\"17\"/><line x1=\"10\" x2=\"8\" y1=\"9\" y2=\"9\"/>",
  "files": "<path d=\"M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1V17\"/><path d=\"M20 7.5V20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6.5L20 7.5z\"/><polyline points=\"14 2 14 8 20 8\"/>",
  "faculty": "<path d=\"M2 2h15a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9\"/><path d=\"M10 6.5h6\"/><circle cx=\"4\" cy=\"6.5\" r=\"2\"/><path d=\"M2 22v-9a2 2 0 0 1 2-2h8\"/><path d=\"M6 11v11\"/><path d=\"M2 17h4\"/>",
  "flame": "<path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z\"/>",
  "flask-conical": "<path d=\"M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2\"/><line x1=\"8.5\" x2=\"15.5\" y1=\"2\" y2=\"2\"/><line x1=\"7\" x2=\"17\" y1=\"16\" y2=\"16\"/>",
  "folder": "<path d=\"M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z\"/>",
  "folder-open": "<path d=\"m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2\"/>",
  "globe": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/>",
  "graduation-cap": "<path d=\"M22 10v6M2 10l10-5 10 5-10 5z\"/><path d=\"M6 12v5c0 2 2 3 6 3s6-1 6-3v-5\"/>",
  "grip-vertical": "<circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"9\" cy=\"5\" r=\"1\"/><circle cx=\"9\" cy=\"19\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"5\" r=\"1\"/><circle cx=\"15\" cy=\"19\" r=\"1\"/>",
  "hand-metal": "<path d=\"M18 12.5V10a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v1.4\"/><path d=\"M14 11V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2\"/><path d=\"M10 10.5V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v9\"/><path d=\"m7 15-1.76-1.76a2 2 0 0 0-2.83 2.82l3.6 3.6C7.5 21.14 9.5 22 12 22h2a8 8 0 0 0 8-8V7a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5.5\"/>",
  "headphones": "<path d=\"M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3\"/>",
  "heart": "<path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/>",
  "home": "<path d=\"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><polyline points=\"9 22 9 12 15 12 15 22\"/>",
  "hourglass": "<path d=\"M5 22h14\"/><path d=\"M5 2h14\"/><path d=\"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22\"/><path d=\"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2\"/>",
  "info": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/>",
  "key": "<path d=\"m21 2-2 2m-1.5 1.5L14 9m-1.5 1.5-2 2m-1-1 2 2m-4.5 1.5a5 5 0 1 1-7.07 7.07 5 5 0 0 1 7.07-7.07Z\"/>",
  "key-round": "<path d=\"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z\"/><circle cx=\"16.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/>",
  "landmark": "<line x1=\"2\" x2=\"22\" y1=\"22\" y2=\"22\"/><line x1=\"4\" x2=\"20\" y1=\"18\" y2=\"18\"/><path d=\"m12 2-10 6h20z\"/><line x1=\"6\" x2=\"6\" y1=\"18\" y2=\"11\"/><line x1=\"10\" x2=\"10\" y1=\"18\" y2=\"11\"/><line x1=\"14\" x2=\"14\" y1=\"18\" y2=\"11\"/><line x1=\"18\" x2=\"18\" y1=\"18\" y2=\"11\"/>",
  "laptop": "<path d=\"M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16\"/>",
  "layers": "<polygon points=\"12 2 2 7 12 12 22 7 12 2\"/><polyline points=\"2 17 12 22 22 17\"/><polyline points=\"2 12 12 17 22 12\"/>",
  "leaf": "<path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z\"/><path d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 12 12\"/>",
  "lightbulb": "<path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\"/><path d=\"M9 18h6\"/><path d=\"M10 22h4\"/>",
  "link": "<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/>",
  "lock": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>",
  "mail": "<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\"/><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\"/>",
  "map-pin": "<path d=\"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/>",
  "megaphone": "<path d=\"m3 11 18-5v12L3 14v-3z\"/><path d=\"M11.6 16.8a3 3 0 1 1-5.8-1.6\"/>",
  "message-circle": "<path d=\"M7.9 20A9 9 0 1 0 4 16.1L2 22Z\"/>",
  "message-square": "<path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"/>",
  "mic": "<path d=\"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z\"/><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"/><line x1=\"12\" x2=\"12\" y1=\"19\" y2=\"22\"/>",
  "minus": "<path d=\"M5 12h14\"/>",
  "monitor": "<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\"/><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\"/><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\"/>",
  "moon": "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/>",
  "network": "<rect x=\"16\" y=\"16\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"2\" y=\"16\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"9\" y=\"2\" width=\"6\" height=\"6\" rx=\"1\"/><path d=\"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3\"/><path d=\"M12 12V8\"/>",
  "newspaper": "<path d=\"M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2\"/><path d=\"M18 14h-8\"/><path d=\"M15 18h-5\"/><path d=\"M10 6h8v4h-8V6Z\"/>",
  "palette": "<circle cx=\"13.5\" cy=\"6.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"17.5\" cy=\"10.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"8.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"6.5\" cy=\"12.5\" r=\".5\" fill=\"currentColor\"/><path d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z\"/>",
  "pen-square": "<path d=\"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"/><path d=\"M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z\"/>",
  "phone": "<path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/>",
  "pie-chart": "<path d=\"M21.21 15.89A10 10 0 1 1 8 2.83\"/><path d=\"M22 12A10 10 0 0 0 12 2v10z\"/>",
  "pin": "<line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"22\"/><path d=\"M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z\"/>",
  "presentation": "<path d=\"M2 2h15a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9\"/><path d=\"M10 6.5h6\"/><circle cx=\"4\" cy=\"6.5\" r=\"2\"/><path d=\"M2 22v-9a2 2 0 0 1 2-2h8\"/><path d=\"M6 11v11\"/><path d=\"M2 17h4\"/>",
  "plus": "<path d=\"M5 12h14\"/><path d=\"M12 5v14\"/>",
  "radio": "<path d=\"M4.9 19.1C1 15.2 1 8.8 4.9 4.9\"/><path d=\"M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5\"/><path d=\"M19.1 4.9C23 8.8 23 15.1 19.1 19\"/>",
  "rocket": "<path d=\"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z\"/><path d=\"m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z\"/><path d=\"M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0\"/><path d=\"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5\"/>",
  "rotate-cw": "<path d=\"M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/>",
  "ruler": "<path d=\"M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z\"/><path d=\"m14.5 12.5 2-2\"/><path d=\"m11.5 9.5 2-2\"/><path d=\"m8.5 6.5 2-2\"/><path d=\"m17.5 15.5 2-2\"/>",
  "save": "<path d=\"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z\"/><polyline points=\"17 21 17 13 7 13 7 21\"/><polyline points=\"7 3 7 8 15 8\"/>",
  "school": "<path d=\"m4 6 8-4 8 4\"/><path d=\"m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2\"/><path d=\"M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4\"/><path d=\"M18 5v17\"/><path d=\"M6 5v17\"/><circle cx=\"12\" cy=\"9\" r=\"2\"/>",
  "scissors": "<circle cx=\"6\" cy=\"6\" r=\"3\"/><path d=\"M8.12 8.12 12 12\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><path d=\"M14.8 14.8 20 20\"/><path d=\"m12 12 8-8\"/><path d=\"m8.12 15.88 3.38-3.38\"/>",
  "scroll": "<path d=\"M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4\"/><path d=\"M19 17V5a2 2 0 0 0-2-2H4\"/>",
  "search": "<circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.3-4.3\"/>",
  "settings": "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
  "shield": "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/>",
  "ship": "<path d=\"M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\"/><path d=\"M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76\"/><path d=\"M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6\"/><path d=\"M12 10v4\"/><path d=\"M12 2v3\"/>",
  "smartphone": "<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\"/><path d=\"M12 18h.01\"/>",
  "sparkles": "<path d=\"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z\"/><path d=\"M5 3v4\"/><path d=\"M19 17v4\"/><path d=\"M3 5h4\"/><path d=\"M17 19h4\"/>",
  "sprout": "<path d=\"M7 20h10\"/><path d=\"M10 20c5.5-2.5.8-6.4 3-10\"/><path d=\"M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z\"/><path d=\"M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z\"/>",
  "star": "<polygon points=\"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2\"/>",
  "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/>",
  "target": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>",
  "teacher": "<path d=\"M2 2h15a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9\"/><path d=\"M10 6.5h6\"/><circle cx=\"4\" cy=\"6.5\" r=\"2\"/><path d=\"M2 22v-9a2 2 0 0 1 2-2h8\"/><path d=\"M6 11v11\"/><path d=\"M2 17h4\"/>",
  "test-tube-2": "<path d=\"M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01v0a2.83 2.83 0 0 1 0-4L17 3\"/><path d=\"m16 2 6 6\"/><path d=\"M12 9h.01\"/>",
  "trash-2": "<path d=\"M3 6h18\"/><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"/><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"/><line x1=\"10\" x2=\"10\" y1=\"11\" y2=\"17\"/><line x1=\"14\" x2=\"14\" y1=\"11\" y2=\"17\"/>",
  "trending-up": "<polyline points=\"22 7 13.5 15.5 8.5 10.5 2 17\"/><polyline points=\"16 7 22 7 22 13\"/>",
  "trophy": "<path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"/><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"/><path d=\"M4 22h16\"/><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"/><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"/><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"/>",
  "upload": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"17 8 12 3 7 8\"/><line x1=\"12\" x2=\"12\" y1=\"3\" y2=\"15\"/>",
  "user-check": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><polyline points=\"16 11 18 13 22 9\"/>",
  "user": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/>",
  "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/>",
  "wrench": "<path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/>",
  "x-circle": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m15 9-6 6\"/><path d=\"m9 9 6 6\"/>",
  "zap": "<polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/>"
};

  var EMOJI_MAP = {
  "\u{1F468}\u{200D}\u{1F4BB}": "graduation-cap",
  "\u{1F469}\u{200D}\u{1F3EB}": "presentation",
  "\u{1F6E1}\u{FE0F}": "shield",
  "\u{26A0}\u{FE0F}": "alert-triangle",
  "\u{1F3AF}": "target",
  "\u{1F31F}": "sparkles",
  "\u{1F680}": "rocket",
  "\u{1F4BB}": "laptop",
  "\u{1F3DB}\u{FE0F}": "landmark",
  "\u{2728}": "sparkles",
  "\u{1F512}": "lock",
  "\u{23F1}\u{FE0F}": "clock",
  "\u{2699}\u{FE0F}": "settings",
  "\u{1F4E5}": "download",
  "\u{26A1}": "zap",
  "\u{1F310}": "globe",
  "\u{1F4DA}": "book-open",
  "\u{1F393}": "graduation-cap",
  "\u{1F465}": "users",
  "\u{1F4DC}": "scroll",
  "\u{1F4CA}": "bar-chart-3",
  "\u{1F514}": "bell",
  "\u{1F4D8}": "book",
  "\u{1F52C}": "flask-conical",
  "\u{1F468}\u{200D}\u{1F3EB}": "presentation",
  "\u{1F4CD}": "map-pin",
  "\u{1F4DE}": "phone",
  "\u{23F0}": "clock",
  "\u{270F}\u{FE0F}": "pen-square",
  "\u{2B50}": "star",
  "\u{1F464}": "user",
  "\u{1FAAA}": "badge-check",
  "\u{2709}\u{FE0F}": "mail",
  "\u{1F5A5}\u{FE0F}": "monitor",
  "\u{1F3C6}": "trophy",
  "\u{1F9EA}": "test-tube-2",
  "\u{1F4C8}": "trending-up",
  "\u{1F6A8}": "alert-octagon",
  "\u{1F967}": "pie-chart",
  "\u{1F504}": "rotate-cw",
  "\u{1F3EB}": "school",
  "\u{23F3}": "hourglass",
  "\u{2705}": "check-circle-2",
  "\u{274C}": "x-circle",
  "\u{2139}\u{FE0F}": "info",
  "\u{2702}\u{FE0F}": "scissors",
  "\u{1F590}\u{FE0F}": "grip-vertical",
  "\u{1F50D}": "search",
  "\u{2796}": "minus",
  "\u{2795}": "plus",
  "\u{1F9D1}\u{200D}\u{1F3EB}": "presentation",
  "\u{1F4D6}": "book-open",
  "\u{1F916}": "bot",
  "\u{1F4CC}": "pin",
  "\u{1F4A1}": "lightbulb",
  "\u{1F4E2}": "megaphone",
  "\u{1F3E0}": "home",
  "\u{1F4DD}": "file-edit",
  "\u{1F5D3}\u{FE0F}": "calendar-days",
  "\u{1F4BE}": "save",
  "\u{1F5D1}\u{FE0F}": "trash-2",
  "\u{1F44B}": "hand-metal",
  "\u{1F510}": "key-round",
  "\u{1F4F8}": "camera",
  "\u{1F4F7}": "camera",
  "\u{1F4C1}": "folder",
  "\u{1F511}": "key",
  "\u{1F6AB}": "ban",
  "\u{1F4C5}": "calendar",
  "\u{1F4C4}": "file-text",
  "\u{21A9}\u{FE0F}": "corner-down-left",
  "\u{1F4E4}": "upload",
  "\u{1F4CB}": "clipboard-list",
  "\u{1F40D}": "code-2",
  "\u{2615}": "coffee",
  "\u{1F5C4}\u{FE0F}": "database",
  "\u{1F4D0}": "ruler",
  "\u{1F5E3}\u{FE0F}": "message-square",
  "\u{2601}\u{FE0F}": "cloud",
  "\u{1F30D}": "globe",
  "\u{1F332}": "network",
  "\u{1F331}": "sprout",
  "\u{26AA}": "circle",
  "\u{1F4C2}": "folder-open",
  "\u{1F441}\u{FE0F}": "eye",
  "\u{1F4D1}": "files",
  "\u{1F525}": "flame",
  "\u{2764}\u{FE0F}": "heart",
  "\u{1F3A4}": "mic",
  "\u{1F3A7}": "headphones",
  "\u{1F4AC}": "message-circle",
  "\u{1F4F1}": "smartphone",
  "\u{1F4E7}": "mail",
  "\u{1F319}": "moon",
  "\u{2600}\u{FE0F}": "sun",
  "\u{1F517}": "link",
  "\u{2B07}\u{FE0F}": "download"
};

  function normalizeName(nameOrEmoji) {
    if (!nameOrEmoji) return 'file-text';
    var trimmed = String(nameOrEmoji).trim();
    if (EMOJI_MAP[trimmed]) return EMOJI_MAP[trimmed];
    // Convert camelCase or PascalCase to kebab-case
    var kebab = trimmed
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/_/g, '-')
      .toLowerCase();
    if (ICON_PATHS[kebab]) return kebab;
    return kebab;
  }

  function escapeXml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Render an SVG string for an icon
   * @param {string} nameOrEmoji - Lucide icon name (e.g. "shield", "lock") or emoji icon string
   * @param {number|object} [optionsOrSize] - Size number (e.g. 20) or options object
   * @returns {string} Safe inline SVG string
   */
  function renderIcon(nameOrEmoji, optionsOrSize) {
    var opts = {};
    if (typeof optionsOrSize === 'number') {
      opts.size = optionsOrSize;
    } else if (optionsOrSize && typeof optionsOrSize === 'object') {
      opts = optionsOrSize;
    }

    var iconKey = normalizeName(nameOrEmoji);
    var pathData = ICON_PATHS[iconKey] || ICON_PATHS['file-text'];
    var size = opts.size || 18;
    var strokeWidth = opts.strokeWidth || (size <= 18 ? 2 : 1.75);
    var className = opts.className ? ' ' + opts.className : '';
    var style = opts.style ? ' style="' + escapeXml(opts.style) + '"' : '';

    var a11yAttrs = '';
    if (opts.ariaLabel) {
      a11yAttrs = ' role="img" aria-label="' + escapeXml(opts.ariaLabel) + '"';
      if (opts.title) {
        a11yAttrs += ' title="' + escapeXml(opts.title) + '"';
      }
    } else {
      a11yAttrs = ' aria-hidden="true"';
    }

    return '<svg class="cs-icon cs-icon-' + iconKey + ' cs-icon-' + size + className + '"' +
      ' width="' + size + '"' +
      ' height="' + size + '"' +
      ' viewBox="0 0 24 24"' +
      ' fill="none"' +
      ' stroke="currentColor"' +
      ' stroke-width="' + strokeWidth + '"' +
      ' stroke-linecap="round"' +
      ' stroke-linejoin="round"' +
      style +
      a11yAttrs +
      '>' + pathData + '</svg>';
  }

  /**
   * Create an SVG DOM node for an icon
   */
  function createIconElement(nameOrEmoji, options) {
    var svgString = renderIcon(nameOrEmoji, options);
    var template = document.createElement('template');
    template.innerHTML = svgString.trim();
    return template.content.firstChild;
  }

  // Register Web Component <cs-icon name="shield" size="24"></cs-icon>
  if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
    if (!customElements.get('cs-icon')) {
      try {
        var CsIcon = function () {
          return Reflect.construct(HTMLElement, [], CsIcon);
        };
        Object.setPrototypeOf(CsIcon.prototype, HTMLElement.prototype);
        Object.setPrototypeOf(CsIcon, HTMLElement);

        CsIcon.prototype.connectedCallback = function () {
          var name = this.getAttribute('name') || this.getAttribute('icon');
          var size = parseInt(this.getAttribute('size') || '18', 10);
          var label = this.getAttribute('aria-label');
          var title = this.getAttribute('title');
          var customClass = this.getAttribute('class') || '';
          this.innerHTML = renderIcon(name, {
            size: size,
            ariaLabel: label,
            title: title,
            className: customClass
          });
        };

        customElements.define('cs-icon', CsIcon);
      } catch (e) {
        // Fallback for environments where customElements construct differs
      }
    }
  }

  return {
    renderIcon: renderIcon,
    createIconElement: createIconElement,
    normalizeName: normalizeName,
    ICON_PATHS: ICON_PATHS,
    EMOJI_MAP: EMOJI_MAP
  };
});
