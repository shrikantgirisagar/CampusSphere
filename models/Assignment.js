const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    studentUsername: { type: String, required: true },
    studentName: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
    fileUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
    grade: { type: String, default: "" }
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    subject: {
      type: String,
      default: ""
    },
    student: {
      type: String,
      default: ""
    },
    targetDivision: {
      type: String,
      default: ""
    },
    fileName: {
      type: String,
      default: ""
    },
    fileData: {
      type: String,
      default: ""
    },
    due: {
      type: String,
      default: ""
    },
    dueDate: {
      type: Date
    },
    status: {
      type: String,
      default: "Pending"
    },
    submittedDate: {
      type: String,
      default: ""
    },
    facultyUsername: {
      type: String,
      default: ""
    },
    submissions: [submissionSchema]
  },
  {
    timestamps: true,
    strict: false,
    versionKey: false
  }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
