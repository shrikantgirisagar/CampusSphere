const mongoose = require("mongoose");

const markSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: ""
    },
    markId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100
    },
    studentUsername: {
      type: String,
      required: true,
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
      required: true,
      trim: true,
      maxlength: 100
    },
    examName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100
    },
    marksObtained: {
      type: Number,
      min: 0,
      max: 1000,
      default: null
    },
    maxMarks: {
      type: Number,
      min: 1,
      max: 1000,
      default: 100
    },
    internal1: {
      type: Number,
      min: 0,
      max: 1000,
      default: null
    },
    internal2: {
      type: Number,
      min: 0,
      max: 1000,
      default: null
    },
    assignment: {
      type: Number,
      min: 0,
      max: 1000,
      default: null
    },
    final: {
      type: Number,
      min: 0,
      max: 1000,
      default: null
    },
    maxInternal1: {
      type: Number,
      min: 0,
      max: 1000,
      default: 20
    },
    maxInternal2: {
      type: Number,
      min: 0,
      max: 1000,
      default: 20
    },
    maxAssignment: {
      type: Number,
      min: 0,
      max: 1000,
      default: 10
    },
    maxFinal: {
      type: Number,
      min: 0,
      max: 1000,
      default: 70
    },
    total: {
      type: Number,
      min: 0,
      max: 1000,
      default: null
    },
    grade: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20
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

// Compound index for student marks lookup by subject
markSchema.index({ studentUsername: 1, subject: 1 });

module.exports = mongoose.model("Mark", markSchema);
