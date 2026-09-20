const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: ""
    },
    attendanceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100
    },
    studentUsername: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
      index: true
    },
    studentName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100
    },
    subject: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100
    },
    division: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    semester: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    courseYear: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    date: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    isoDate: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    status: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    records: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    facultyUsername: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    }
  },
  {
    timestamps: true,
    strict: true,
    versionKey: false
  }
);

// Compound index for student attendance lookups
attendanceSchema.index({ studentUsername: 1, date: -1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
