const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    attendanceId: {
      type: String,
      required: true,
      unique: true
    },
    studentUsername: {
      type: String,
      default: "",
      index: true
    },
    studentName: {
      type: String,
      default: ""
    },
    subject: {
      type: String,
      default: ""
    },
    division: {
      type: String,
      default: ""
    },
    semester: {
      type: String,
      default: ""
    },
    courseYear: {
      type: String,
      default: ""
    },
    date: {
      type: String,
      default: ""
    },
    isoDate: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      default: ""
    },
    records: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    facultyUsername: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    strict: false,
    versionKey: false
  }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
