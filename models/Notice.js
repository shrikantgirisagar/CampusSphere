const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    noticeId: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    text: {
      type: String,
      default: ""
    },
    content: {
      type: String,
      default: ""
    },
    date: {
      type: String,
      default: ""
    },
    target: {
      type: String,
      default: "all"
    },
    postedBy: {
      type: String,
      default: ""
    },
    postedByName: {
      type: String,
      default: ""
    },
    authorRole: {
      type: String,
      default: ""
    },
    authorName: {
      type: String,
      default: ""
    },
    targetRole: {
      type: String,
      default: "all"
    },
    targetDivision: {
      type: String,
      default: "all"
    },
    targetSemester: {
      type: String,
      default: "all"
    },
    fileName: {
      type: String,
      default: ""
    },
    fileData: {
      type: String,
      default: ""
    },
    isImportant: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    strict: false,
    versionKey: false
  }
);

module.exports = mongoose.model("Notice", noticeSchema);
