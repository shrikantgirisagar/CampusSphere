const mongoose = require("mongoose");

const markSchema = new mongoose.Schema(
  {
    markId: {
      type: String,
      required: true,
      unique: true
    },
    studentUsername: {
      type: String,
      required: true,
      index: true
    },
    studentName: {
      type: String,
      default: ""
    },
    subject: {
      type: String,
      required: true
    },
    examName: {
      type: String,
      default: ""
    },
    marksObtained: {
      type: Number,
      default: null
    },
    maxMarks: {
      type: Number,
      default: 100
    },
    internal1: {
      type: Number,
      default: null
    },
    internal2: {
      type: Number,
      default: null
    },
    assignment: {
      type: Number,
      default: null
    },
    final: {
      type: Number,
      default: null
    },
    maxInternal1: {
      type: Number,
      default: 20
    },
    maxInternal2: {
      type: Number,
      default: 20
    },
    maxAssignment: {
      type: Number,
      default: 10
    },
    maxFinal: {
      type: Number,
      default: 70
    },
    total: {
      type: Number,
      default: null
    },
    grade: {
      type: String,
      default: ""
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

module.exports = mongoose.model("Mark", markSchema);
