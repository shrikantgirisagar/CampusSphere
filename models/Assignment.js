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
    id: {
      type: String,
      default: ""
    },
    assignmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    description: {
      type: String,
      default: ""
    },
    subject: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100
    },
    student: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    targetDivision: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
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
      default: "",
      trim: true,
      maxlength: 50
    },
    dueDate: {
      type: Date
    },
    status: {
      type: String,
      default: "Pending",
      trim: true,
      maxlength: 50
    },
    submittedDate: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    facultyUsername: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    submissions: [submissionSchema]
  },
  {
    timestamps: true,
    strict: true,
    versionKey: false
  }
);

// Compound index for filtering assignments by subject and division
assignmentSchema.index({ subject: 1, targetDivision: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
