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
    versionKey: false
  }
);

module.exports = mongoose.model("AcademicStore", academicStoreSchema);

