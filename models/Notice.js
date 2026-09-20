const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: ""
    },
    noticeId: {
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
    strict: true,
    versionKey: false
  }
);

// Index for chronological notice feeds
noticeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notice", noticeSchema);
