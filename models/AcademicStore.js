const mongoose = require("mongoose");

const academicStoreSchema = new mongoose.Schema(
  {
    storeKey: {
      type: String,
      default: "default_academic_store",
      unique: true,
      index: true
    },
    students: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    notices: {
      type: Array,
      default: []
    },
    timetable: {
      type: Array,
      default: []
    },
    timetableHeader: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    customBreakRows: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    assignments: {
      type: Array,
      default: []
    },
    notes: {
      type: Array,
      default: []
    },
    deletedAssignments: {
      type: Array,
      default: []
    },
    deletedDailyAttendance: {
      type: Array,
      default: []
    },
    dailyAttendance: {
      type: Array,
      default: []
    },
    subjectMarksConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    subjects: {
      type: Array,
      default: []
    },
    divisions: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        "1st Year": ["Div A", "Div B"],
        "2nd Year": ["Div A", "Div B"],
        "3rd Year": ["Div A", "Div B"]
      })
    }
  },
  {
    timestamps: true,
    strict: true,
    versionKey: "__v",
    optimisticConcurrency: true
  }
);

const MAX_ACADEMIC_STORE_BYTES = 16 * 1024 * 1024; // 16 MB BSON document limit

// Size check guard before save to prevent MongoDB BSON size overflow and return HTTP 413
academicStoreSchema.pre("save", function () {
  try {
    const jsonStr = JSON.stringify(this.toObject());
    const approxBytes = Buffer.byteLength(jsonStr, "utf8");
    if (approxBytes > MAX_ACADEMIC_STORE_BYTES) {
      const err = new Error("Academic store payload exceeds maximum document size limit (16MB).");
      err.status = 413;
      err.statusCode = 413;
      throw err;
    }
  } catch (err) {
    if (err.status === 413) throw err;
  }
});

module.exports = mongoose.model("AcademicStore", academicStoreSchema);

