const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: ""
    },
    noteId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
      index: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    division: {
      type: String,
      default: "All Divisions",
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
    uploadedBy: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    uploadedByName: {
      type: String,
      default: "Faculty",
      trim: true,
      maxlength: 100
    },
    date: {
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

// Compound index for study notes filtering by subject and division
noteSchema.index({ subject: 1, division: 1 });

module.exports = mongoose.model("Note", noteSchema);
